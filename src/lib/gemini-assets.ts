import { DocumentStatus, DocumentType, JobStatus, ContextAction, JobDocument } from "@/lib/types";
import { generateWithRetry } from "@/lib/gemini";

// ------------------------------------------------------------------
// 1. Document Status Evaluation
// ------------------------------------------------------------------

export interface DocumentStatusEvaluation {
    status: DocumentStatus;
    reason: string;
    confidence: number;
}


// Helper to ensure reason is a string (sanitizing AI output)
function ensureString(value: any): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        if (value.content && typeof value.content === 'string') return value.content;
        return JSON.stringify(value);
    }
    return String(value || '');
}

export async function evaluateDocumentStatus(params: {
    document_type: DocumentType;
    current_resume_version: string;
    document_resume_version?: string;
    job_stage: JobStatus;
    days_since_update: number;
    document_exists: boolean;
}): Promise<DocumentStatusEvaluation> {
    const prompt = `
You are a Career Document Analyst.
Evaluate the status of this job application document.

Document Type: ${params.document_type}
Current Resume Version: ${params.current_resume_version}
Document Created With Resume Version: ${params.document_resume_version || 'N/A'}
Job Stage: ${params.job_stage}
Days Since Last Update: ${params.days_since_update}
Document Exists: ${params.document_exists}

Rules:
1. If document doesn't exist → status: "missing"
2. If resume versions don't match → status: "needs_update"
3. If days_since_update > 30 → status: "needs_update"
4. If job_stage is INTERVIEW and document_type is thank_you_email → status: "ready" if exists, else "missing"
5. Otherwise → status: "ready"

Output JSON:
{
  "status": "ready" | "needs_update" | "draft" | "missing",
  "reason": "string (1 sentence explanation)",
  "confidence": number (0-100)
}
`;

    try {
        const result = await generateWithRetry(prompt, 3, { expectJson: true });
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return {
            ...data,
            reason: ensureString(data.reason)
        } as DocumentStatusEvaluation;
    } catch (error) {
        console.error("Gemini Document Status Evaluation Error:", error);
        // Fallback rule-based logic
        if (!params.document_exists) {
            return { status: 'missing', reason: 'Document not yet generated', confidence: 100 };
        }
        if (params.document_resume_version && params.document_resume_version !== params.current_resume_version) {
            return { status: 'needs_update', reason: `Resume version changed from ${params.document_resume_version} → ${params.current_resume_version}`, confidence: 100 };
        }
        if (params.days_since_update > 30) {
            return { status: 'needs_update', reason: `Document is ${params.days_since_update} days old`, confidence: 90 };
        }
        return { status: 'ready', reason: 'Document is current', confidence: 80 };
    }
}

// ------------------------------------------------------------------
// 2. Resume-Document Dependency Analysis
// ------------------------------------------------------------------

export interface ResumeDependencyAnalysis {
    documents_to_update: {
        document_id: string;
        reason: string;
        severity: 'high' | 'medium' | 'low';
    }[];
    summary: string;
}

export async function analyzeResumeDependencies(params: {
    old_resume_version: string;
    new_resume_version: string;
    resume_diff_summary: string;
    affected_documents: JobDocument[];
}): Promise<ResumeDependencyAnalysis> {
    const prompt = `
You are a Resume-Document Dependency Analyzer.
The user changed their resume for this job application.

Old Resume Version: ${params.old_resume_version}
New Resume Version: ${params.new_resume_version}
Changes Summary: ${params.resume_diff_summary}

Affected Documents:
${JSON.stringify(params.affected_documents.map(d => ({
        id: d.id,
        document_id: d.document_id,
        type: d.document_type,
        last_updated: d.last_updated_at
    })))}

Task: Determine which documents need to be regenerated and why.

Rules:
1. Cover letters ALWAYS need updates when resume changes
2. Thank you / follow-up emails need updates if experience or skills changed significantly
3. Severity: "high" if document was recently sent, "medium" if draft, "low" if old

Output JSON:
{
  "documents_to_update": [
    {
        "document_id": "string",
        "reason": "string (specific change that affects this document)",
        "severity": "high" | "medium" | "low"
    }
  ],
  "summary": "string (1-2 sentences for user notification)"
}
`;

    try {
        const result = await generateWithRetry(prompt, 3, { expectJson: true });
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        return {
            summary: ensureString(data.summary),
            documents_to_update: (data.documents_to_update || []).map((d: any) => ({
                ...d,
                reason: ensureString(d.reason)
            }))
        } as ResumeDependencyAnalysis;
    } catch (error) {
        console.error("Gemini Resume Dependency Analysis Error:", error);
        // Fallback: Mark all cover letters as needing update
        const documentsToUpdate = params.affected_documents
            .filter(d => d.document_type === 'cover_letter' && d.document_id)
            .map(d => ({
                document_id: d.document_id!,
                reason: 'Resume version changed',
                severity: 'medium' as const
            }));

        return {
            documents_to_update: documentsToUpdate,
            summary: `Resume updated from ${params.old_resume_version} to ${params.new_resume_version}. ${documentsToUpdate.length} document(s) may need updates.`
        };
    }
}

// ------------------------------------------------------------------
// 3. Context-Aware Next Action Selection
// ------------------------------------------------------------------

export async function selectNextActions(params: {
    job_stage: JobStatus;
    days_in_stage: number;
    required_documents: JobDocument[];
    optional_documents: JobDocument[];
}): Promise<ContextAction[]> {
    const prompt = `
You are a Career Strategy AI.
Recommend the SINGLE BEST next action for this job application.

Job Stage: ${params.job_stage}
Days in Current Stage: ${params.days_in_stage}
Required Documents: ${JSON.stringify(params.required_documents.map(d => ({ type: d.document_type, status: d.status })))}
Optional Documents: ${JSON.stringify(params.optional_documents.map(d => ({ type: d.document_type, status: d.status })))}

Rules:
1. If any required document is missing → action: "Generate [Document Type]"
2. If job_stage is APPLIED and days_in_stage > 7 → action: "Generate Follow-Up Email"
3. If job_stage is INTERVIEW → action: "Generate Thank You Email"
4. If job_stage is SAVED → action: "Review Application" or "Optimize Resume"
5. NEVER return more than 2 actions
6. Primary action is the MOST important, secondary is optional

Output JSON:
{
  "actions": [
    {
      "id": "string (uuid)",
      "label": "string (e.g., 'Generate Follow-Up Email')",
      "type": "generate" | "regenerate" | "review" | "optimize",
      "priority": "primary" | "secondary",
      "document_type": "cover_letter" | "thank_you_email" | "follow_up_email" | null
    }
  ]
}
`;

    try {
        const result = await generateWithRetry(prompt, 3, { expectJson: true });
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return data.actions as ContextAction[];
    } catch (error) {
        console.error("Gemini Next Action Selection Error:", error);
        // Fallback rule-based logic
        const actions: ContextAction[] = [];

        // Check for missing required documents
        const missingRequired = params.required_documents.find(d => d.status === 'missing');
        if (missingRequired) {
            actions.push({
                id: crypto.randomUUID(),
                label: `Generate ${missingRequired.document_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
                type: 'generate',
                priority: 'primary',
                document_type: missingRequired.document_type
            });
        } else if (params.job_stage === 'INTERVIEW') {
            const thankYou = [...params.required_documents, ...params.optional_documents]
                .find(d => d.document_type === 'thank_you_email');
            if (thankYou?.status === 'missing') {
                actions.push({
                    id: crypto.randomUUID(),
                    label: 'Generate Thank You Email',
                    type: 'generate',
                    priority: 'primary',
                    document_type: 'thank_you_email'
                });
            }
        } else if (params.job_stage === 'APPLIED' && params.days_in_stage > 7) {
            actions.push({
                id: crypto.randomUUID(),
                label: 'Generate Follow-Up Email',
                type: 'generate',
                priority: 'primary',
                document_type: 'follow_up_email'
            });
        } else if (params.job_stage === 'SAVED') {
            actions.push({
                id: crypto.randomUUID(),
                label: 'Optimize Resume for Job',
                type: 'optimize',
                priority: 'primary'
            });
        }

        return actions.slice(0, 2); // Max 2 actions
    }
}

// ------------------------------------------------------------------
// 4. Safe Document Regeneration
// ------------------------------------------------------------------

export async function regenerateDocument(params: {
    document_type: DocumentType;
    job_title: string;
    company_name: string;
    resume_content: string;
    job_description?: string;
    previous_content?: string;
}): Promise<string> {
    const documentTypeLabel = params.document_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    const prompt = `
You are an Expert Career Document Writer.
Generate a ${documentTypeLabel} for this job application.

Job Title: ${params.job_title}
Company: ${params.company_name}

Resume Content:
"""
${params.resume_content.slice(0, 10000)}
"""

${params.job_description ? `
Job Description:
"""
${params.job_description.slice(0, 10000)}
"""
` : ''}

${params.previous_content ? `
Previous Version (for reference):
"""
${params.previous_content.slice(0, 5000)}
"""
` : ''}

CRITICAL CONSTRAINTS:
1. DO NOT hallucinate experience. Only use facts from the resume.
2. DO NOT invent projects, skills, or accomplishments.
3. Tone: Professional, confident, personalized.
4. Length: 
   - Cover letter: 3-4 paragraphs, ~300 words
   - Thank you email: 2-3 paragraphs, ~150 words
   - Follow-up email: 2 paragraphs, ~100 words

Output: Plain text content only. No JSON wrapper. No markdown formatting.
`;

    try {
        const result = await generateWithRetry(prompt, 3, { expectJson: false });
        const text = result.response.text();
        if (!text || text === '[image]') {
            throw new Error("Generated content was empty or invalid image placeholder.");
        }
        return text.trim();
    } catch (error) {
        console.error("Gemini Document Regeneration Error:", error);
        throw new Error(`Failed to generate ${documentTypeLabel}`);
    }
}

// ------------------------------------------------------------------
// 5. Batch Document Status Evaluation (Performance Optimization)
// ------------------------------------------------------------------

export async function batchEvaluateDocumentStatuses(
    documents: Array<{
        id: string;
        document_type: DocumentType;
        current_resume_version: string;
        document_resume_version?: string;
        job_stage: JobStatus;
        days_since_update: number;
        document_exists: boolean;
    }>
): Promise<Map<string, DocumentStatusEvaluation>> {
    const prompt = `
You are a Career Document Analyst.
Evaluate the status of multiple job application documents in batch.

Documents:
${JSON.stringify(documents, null, 2)}

For each document, apply these rules:
1. If document doesn't exist → status: "missing"
2. If resume versions don't match → status: "needs_update"
3. If days_since_update > 30 → status: "needs_update"
4. Otherwise → status: "ready"

Output JSON (array of evaluations):
{
  "evaluations": [
    {
      "id": "string (document id)",
      "status": "ready" | "needs_update" | "draft" | "missing",
      "reason": "string (1 sentence explanation)",
      "confidence": number (0-100)
    }
  ]
}
`;

    try {
        const result = await generateWithRetry(prompt, 3, { expectJson: true });
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        const evaluationMap = new Map<string, DocumentStatusEvaluation>();
        for (const evaluation of data.evaluations) {
            evaluationMap.set(evaluation.id, {
                status: evaluation.status,
                reason: ensureString(evaluation.reason),
                confidence: evaluation.confidence
            });
        }

        return evaluationMap;
    } catch (error) {
        console.error("Gemini Batch Document Status Evaluation Error:", error);
        // Fallback: Evaluate each individually using rule-based logic
        const evaluationMap = new Map<string, DocumentStatusEvaluation>();

        for (const doc of documents) {
            if (!doc.document_exists) {
                evaluationMap.set(doc.id, { status: 'missing', reason: 'Document not yet generated', confidence: 100 });
            } else if (doc.document_resume_version && doc.document_resume_version !== doc.current_resume_version) {
                evaluationMap.set(doc.id, {
                    status: 'needs_update',
                    reason: `Resume version changed from ${doc.document_resume_version} → ${doc.current_resume_version}`,
                    confidence: 100
                });
            } else if (doc.days_since_update > 30) {
                evaluationMap.set(doc.id, {
                    status: 'needs_update',
                    reason: `Document is ${doc.days_since_update} days old`,
                    confidence: 90
                });
            } else {
                evaluationMap.set(doc.id, { status: 'ready', reason: 'Document is current', confidence: 80 });
            }
        }

        return evaluationMap;
    }
}

