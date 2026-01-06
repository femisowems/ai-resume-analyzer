import { GoogleGenerativeAI } from "@google/generative-ai";
import { Job } from "@/lib/types";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use the same standardized flash model for consistency and speed
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ------------------------------------------------------------------
// 1. Strategic Briefing (For the Dashboard Header)
// ------------------------------------------------------------------

export interface StrategicBriefing {
    briefing: string;
    attention_queue: {
        job_id: string;
        reason: string;
        suggested_action: string
    }[];
}

export async function generateStrategicBriefing(jobs: Job[]): Promise<StrategicBriefing> {
    // Filter down to active jobs to save tokens
    const activeJobs = jobs
        .filter(j => j.status !== 'ARCHIVED' && j.status !== 'REJECTED')
        .map(j => ({
            id: j.id,
            company: j.company_name,
            role: j.role,
            status: j.status,
            days_in_stage: j.updated_at
                ? Math.floor((new Date().getTime() - new Date(j.updated_at).getTime()) / (1000 * 3600 * 24))
                : 0
        }));

    const prompt = `
    You are a Career Strategy AI.
    Review this active job pipeline and generate a daily briefing.

    Active Jobs Data:
    ${JSON.stringify(activeJobs)}

    Task 1: Generate a natural language "Briefing" (1-2 sentences).
    - Tone: Professional, motivating, concise.
    - Focus: Upcoming interviews (if any), then stalled applications (14+ days), then general progress.
    - Example: "You have 2 interviews this week. Focus on prep. 3 other applications are stalled."

    Task 2: Build an "Attention Queue".
    - identifying jobs that need action (stalled > 14 days, interview scheduled, offer received).
    - Reason: Why is it flagged?
    - Action: Concrete next step (e.g. "Send follow-up", "Prepare case study").

    Output JSON:
    {
      "briefing": "string",
      "attention_queue": [ 
          { "job_id": "string", "reason": "string", "suggested_action": "string" } 
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as StrategicBriefing;
    } catch (error) {
        console.error("Gemini Briefing Error:", error);
        return {
            briefing: "Welcome back. Let's make progress on your applications today.",
            attention_queue: []
        };
    }
}

// ------------------------------------------------------------------
// 2. Job Match Analysis
// ------------------------------------------------------------------

export interface JobMatchAnalysis {
    match_score: number;
    keywords_matched: string[];
    missing_keywords: string[];
    present_keywords: string[];
    overall_fit: string;
    analysis_text: string;
    interview_prep_questions: string[];
}

export async function analyzeJobMatch(resumeText: string, jobDescription: string): Promise<JobMatchAnalysis> {
    const prompt = `
    You are a FAANG Recruiter.
    Analyze the match between this Resume and Job Description.

    Resume: "${resumeText.slice(0, 10000)}..."
    Job Description: "${jobDescription.slice(0, 10000)}..."

    Task:
    1. Score the match (0-100). Be strict. 70+ is good.
    2. Extract KEYWORDS from JD that are present in Resume.
    3. Extract KEYWORDS from JD that are MISSING in Resume.
    4. Provide a textual analysis of the fit (strengths/weaknesses).

    Output JSON:
    {
      "match_score": number, // 0-100
      "keywords_matched": ["string"],
      "missing_keywords": ["string"],
      "present_keywords": ["string"], // same as keywords_matched, for consistency
      "overall_fit": "string",
      "analysis_text": "string (Detailed feedback paragraph)",
      "interview_prep_questions": ["string"] // Legacy field, keep empty or minimal
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as JobMatchAnalysis;
    } catch (error) {
        console.error("Gemini Job Match Error:", error);
        throw new Error("Failed to analyze job match");
    }
}

// ------------------------------------------------------------------
// 3. Next Best Action (NBA) Engine
// ------------------------------------------------------------------

export interface NextBestAction {
    action: string;
    reason: string;
    type: 'urgent' | 'document' | 'outreach' | 'prep';
}

export async function generateNextBestAction(jobState: {
    status: string,
    days_in_stage: number,
    match_score: number,
    last_activity_type?: string
}): Promise<NextBestAction> {
    const prompt = `
    You are a Career Strategy Coach.
    Determine the single most high-leverage "Next Best Action" for this job application.

    Context:
    - Status: ${jobState.status}
    - Days in current stage: ${jobState.days_in_stage}
    - Resume Match Score: ${jobState.match_score || 'Unknown'}
    - Last Activity: ${jobState.last_activity_type || 'None'}

    Rules:
    - If status is APPLIED and > 7 days passed: Suggest "follow-up".
    - If status is INTERVIEW: Suggest "prep" or "mock interview".
    - If status is SAVED: Suggest "optimize resume" or "apply".
    - If match score is low (< 60) and status is SAVED/APPLIED: Suggest "tailor resume".

    Output JSON:
    {
      "action": "string (Short command, e.g. 'Send Follow-up Email')",
      "reason": "string (Why? e.g. 'It has been 8 days since applying.')",
      "type": "string (urgent | document | outreach | prep)"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as NextBestAction;
    } catch (error) {
        // Fallback rule-based
        if (jobState.status === 'INTERVIEW') return { action: 'Prepare for Interview', reason: 'Interview stage active', type: 'prep' };
        if (jobState.days_in_stage > 14) return { action: 'Send Follow-up', reason: 'No movement for 2 weeks', type: 'outreach' };
        return { action: 'Review Application', reason: 'Keep momentum going', type: 'document' };
    }
}

// ------------------------------------------------------------------
// 4. Interview Prep Generator
// ------------------------------------------------------------------

export interface InterviewPrepData {
    questions: string[];
    notes: string;
}

export async function generateInterviewPrep(jobTitle: string, companyName: string, jobDescription: string): Promise<InterviewPrepData> {
    const prompt = `
    Generate distinct interview questions for:
    Role: ${jobTitle}
    Company: ${companyName}
    JD Snippet: "${jobDescription.slice(0, 3000)}..."

    Task:
    1. Generate 5 likely questions (mix of Behavioral, Technical, and Company-Specific).
    2. Provide a short "Prep Note" on culture or focus.

    Output JSON:
    {
      "questions": ["string", "string", "string", "string", "string"],
      "notes": "string"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as InterviewPrepData;
    } catch (error) {
        return {
            questions: [
                "Tell me about yourself.",
                "Why do you want to work at " + companyName + "?",
                "Describe a challenging technical problem you solved.",
                "How do you handle conflict in a team?"
            ],
            notes: "Focus on standard behavioral questions as fallback."
        };
    }
}
