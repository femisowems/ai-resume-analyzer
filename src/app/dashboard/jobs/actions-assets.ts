'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    ApplicationAssetsData,
    JobAsset,
    JobDocument,
    DocumentType,
    DocumentStatus,
    ContextAction
} from '@/lib/types'
import {
    analyzeResumeDependencies,
    regenerateDocument,
    selectNextActions,
    batchEvaluateDocumentStatuses
} from '@/lib/gemini-assets'

// ------------------------------------------------------------------
// 1. Fetch Application Assets Data
// ------------------------------------------------------------------

export async function fetchApplicationAssets(
    jobId: string
): Promise<ApplicationAssetsData> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Fetch job with current resume
    const { data: job } = await supabase
        .from('job_applications')
        .select('*, current_resume_version_id, status, created_at')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        throw new Error('Job not found')
    }

    // Fetch job asset (resume used)
    const { data: jobAsset } = await supabase
        .from('job_assets')
        .select(`
            *,
            resume_version:resume_versions(
                id,
                version_number,
                resume:resumes(
                    id,
                    title
                )
            )
        `)
        .eq('job_id', jobId)
        .maybeSingle()

    // Fetch job documents
    const { data: jobDocuments } = await supabase
        .from('job_documents')
        .select(`
            *,
            document:documents(*)
        `)
        .eq('job_id', jobId)
        .order('priority', { ascending: true })
        .order('document_type', { ascending: true })

    const documents = jobDocuments || []

    // Separate required and optional documents
    const required_documents = documents.filter(d => d.priority === 'required')
    const optional_documents = documents.filter(d => d.priority === 'optional')

    // Calculate days in current stage
    const daysInStage = Math.floor(
        (new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 3600 * 24)
    )

    // Get AI-recommended next actions (Moved to client-side fetch for performance)
    const next_actions: ContextAction[] = []

    return {
        resume_used: jobAsset as JobAsset | null,
        required_documents,
        optional_documents,
        next_actions
    }
}

// ------------------------------------------------------------------
// 1.5 Fetch Suggested Actions (Lazy Load)
// ------------------------------------------------------------------

export async function fetchSuggestedActions(jobId: string): Promise<ContextAction[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch job status and documents again (securely)
    const { data: job } = await supabase
        .from('job_applications')
        .select('status, created_at')
        .eq('id', jobId)
        .single()

    if (!job) return []

    const { data: jobDocuments } = await supabase
        .from('job_documents')
        .select('*, document:documents(*)')
        .eq('job_id', jobId)

    const documents = jobDocuments || []
    const required_documents = documents.filter(d => d.priority === 'required')
    const optional_documents = documents.filter(d => d.priority === 'optional')

    const daysInStage = Math.floor(
        (new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 3600 * 24)
    )

    try {
        return await selectNextActions({
            job_stage: job.status,
            days_in_stage: daysInStage,
            required_documents,
            optional_documents
        })
    } catch (error) {
        console.error('Failed to fetch suggested actions:', error)
        return []
    }
}

// ------------------------------------------------------------------
// 2. Change Job Resume
// ------------------------------------------------------------------

export async function changeJobResume(
    jobId: string,
    newResumeVersionId: string
): Promise<{ success: boolean; affected_documents: string[]; summary: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Get current job asset
    const { data: currentAsset } = await supabase
        .from('job_assets')
        .select('*, resume_version:resume_versions(version_number)')
        .eq('job_id', jobId)
        .maybeSingle()

    const oldResumeVersion = currentAsset?.resume_version?.version_number || 'v1.0'

    // Get new resume version
    const { data: newResumeVersion } = await supabase
        .from('resume_versions')
        .select('version_number')
        .eq('id', newResumeVersionId)
        .single()

    if (!newResumeVersion) {
        throw new Error('Resume version not found')
    }

    // Get affected documents
    const { data: jobDocuments } = await supabase
        .from('job_documents')
        .select('*')
        .eq('job_id', jobId)
        .not('document_id', 'is', null)

    const affectedDocuments = jobDocuments || []

    // Analyze dependencies using AI
    const analysis = await analyzeResumeDependencies({
        old_resume_version: `v${oldResumeVersion}`,
        new_resume_version: `v${newResumeVersion.version_number}`,
        resume_diff_summary: 'Resume version changed',
        affected_documents: affectedDocuments as JobDocument[]
    })

    // Update or create job asset
    if (currentAsset) {
        await supabase
            .from('job_assets')
            .update({
                resume_version_id: newResumeVersionId,
                last_changed_at: new Date().toISOString()
            })
            .eq('job_id', jobId)
    } else {
        await supabase
            .from('job_assets')
            .insert({
                job_id: jobId,
                resume_version_id: newResumeVersionId
            })
    }

    // Update job application
    await supabase
        .from('job_applications')
        .update({
            current_resume_version_id: newResumeVersionId,
            resume_version_id: newResumeVersionId,
            resume_changed_at: new Date().toISOString()
        })
        .eq('id', jobId)

    // Mark affected documents as needs_update
    for (const docUpdate of analysis.documents_to_update) {
        const jobDoc = affectedDocuments.find(d => d.document_id === docUpdate.document_id)
        if (!jobDoc) continue

        // Update status
        await supabase
            .from('job_documents')
            .update({
                status: 'needs_update' as DocumentStatus,
                status_reason: docUpdate.reason
            })
            .eq('id', jobDoc.id)

        // Create status event
        await supabase
            .from('document_status_events')
            .insert({
                job_document_id: jobDoc.id,
                old_status: jobDoc.status,
                new_status: 'needs_update' as DocumentStatus,
                reason: docUpdate.reason,
                triggered_by: 'resume_change'
            })
    }

    revalidatePath(`/dashboard/jobs/${jobId}`)

    return {
        success: true,
        affected_documents: analysis.documents_to_update.map(d => d.document_id),
        summary: analysis.summary
    }
}

// ------------------------------------------------------------------
// 3. Regenerate Job Document
// ------------------------------------------------------------------

export async function regenerateJobDocument(
    jobDocumentId: string
): Promise<{ success: boolean; content: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    console.log('[Regenerate Debug] Looking for ID:', jobDocumentId)

    // 1. Raw check - does the row exist at all?
    const { data: rawDoc, error: rawError } = await supabase
        .from('job_documents')
        .select('id, job_id, document_id, document_type')
        .eq('id', jobDocumentId)
        .maybeSingle()

    console.log('[Regenerate Debug] Raw lookup:', rawDoc ? 'Found' : 'Not Found', rawError || '')

    // Fetch job document with related data (Original logic)
    let { data: jobDoc } = await supabase
        .from('job_documents')
        .select(`
            *,
            document:documents(*),
            job:job_applications(
                id,
                job_title,
                company_name,
                job_description,
                current_resume_version_id
            )
        `)
        .eq('id', jobDocumentId)
        .maybeSingle()

    if (!jobDoc) {
        // Fallback: Try fetching by document_id in case the frontend passed the underlying document ID
        console.log('[Regenerate Debug] jobDoc lookup by ID failed, trying by document_id...')
        const { data: jobDocByDocId } = await supabase
            .from('job_documents')
            .select(`
                *,
                document:documents(*),
                job:job_applications(
                    id,
                    job_title,
                    company_name,
                    job_description,
                    current_resume_version_id
                )
            `)
            .eq('document_id', jobDocumentId)
            .maybeSingle()

        if (jobDocByDocId) {
            console.log('[Regenerate Debug] Found jobDoc by document_id')
            jobDoc = jobDocByDocId
        }
    }

    // Initialize data variables with potentially partial data
    let jobData: any = jobDoc?.job
    let previousContent: string | undefined = jobDoc?.document?.content

    // Fallback: If joined query failed (jobDoc is null) but we verified the row exists (rawDoc), recover manually
    if (!jobDoc && rawDoc) {
        console.log('[Regenerate Debug] Joined query failed, recovering using rawDoc IDs...')

        if (!rawDoc.job_id) {
            console.error('[Regenerate Debug] rawDoc has no job_id')
        } else {
            // 1. Fetch Job manually
            console.log('[Regenerate Debug] Attempting to fetch Job ID:', rawDoc.job_id)
            const { data: manualJob, error: manualJobError } = await supabase
                .from('job_applications')
                .select('id, job_title, company_name, job_description, current_resume_version_id')
                .eq('id', rawDoc.job_id)
                .maybeSingle()

            console.log('[Regenerate Debug] Manual Job Fetch:', manualJob ? 'Success' : 'Failed', manualJobError || '')

            // 2. Fetch Document manually (if exists)
            if (rawDoc.document_id) {
                const { data: manualDoc } = await supabase
                    .from('documents')
                    .select('content')
                    .eq('id', rawDoc.document_id)
                    .maybeSingle()
                previousContent = manualDoc?.content
            }

            if (manualJob) {
                jobData = manualJob
                // Construct a synthetic jobDoc just enough for type checks if needed
                jobDoc = {
                    ...rawDoc,
                    job: manualJob,
                    document: { content: previousContent }
                } as any
            }
        }
    }

    console.log('[Regenerate Debug] ID:', jobDocumentId, 'User:', user.id)

    if (!jobData) {
        const jobId = rawDoc?.job_id || 'unknown'
        const errorMsg = `Job not found for this document. Job ID: ${jobId}, User: ${user.id}. RawDoc Found: ${!!rawDoc}`
        console.error('[Regenerate Debug]', errorMsg)
        throw new Error(errorMsg)
    }

    // Fetch resume content using the resolved jobData
    const { data: resumeVersion } = await supabase
        .from('resume_versions')
        .select('content')
        .eq('id', jobData.current_resume_version_id)
        .single()

    // Safety check for resume version
    if (!resumeVersion) {
        throw new Error('Resume version not found')
    }

    // Extract resume text
    const resumeContent = resumeVersion.content?.raw_text ||
        JSON.stringify(resumeVersion.content)

    // Generate new content using AI
    const newContent = await regenerateDocument({
        document_type: (jobDoc?.document_type || rawDoc?.document_type) as DocumentType,
        job_title: jobData.job_title,
        company_name: jobData.company_name,
        resume_content: resumeContent,
        job_description: jobData.job_description,
        previous_content: previousContent
    })

    // Update document content
    const targetDocId = jobDoc?.document_id || rawDoc?.document_id
    if (targetDocId) {
        await supabase
            .from('documents')
            .update({
                content: newContent,
                updated_at: new Date().toISOString()
            })
            .eq('id', targetDocId)
    } else {
        // Create new document
        const { data: newDoc } = await supabase
            .from('documents')
            .insert({
                id: crypto.randomUUID(),
                user_id: user.id,
                type: (jobDoc?.document_type || rawDoc?.document_type),
                title: `${(jobDoc?.document_type || rawDoc?.document_type).replace('_', ' ')} - ${jobData.company_name}`,
                content: newContent,
                status: 'active'
            })
            .select()
            .single()

        if (newDoc) {
            await supabase
                .from('job_documents')
                .update({ document_id: newDoc.id })
                .eq('id', jobDocumentId)
        }
    }

    // Update job document status
    const oldStatus = jobDoc?.status || 'missing'
    await supabase
        .from('job_documents')
        .update({
            status: 'ready' as DocumentStatus,
            status_reason: null,
            last_updated_at: new Date().toISOString(),
            generated_at: jobDoc?.generated_at || new Date().toISOString(),
            depends_on_resume_version_id: jobData.current_resume_version_id
        })
        .eq('id', jobDocumentId)

    // Create status event
    await supabase
        .from('document_status_events')
        .insert({
            job_document_id: jobDocumentId,
            old_status: oldStatus,
            new_status: 'ready' as DocumentStatus,
            reason: 'Document regenerated',
            triggered_by: 'user'
        })

    revalidatePath(`/dashboard/jobs/${jobData.id}`)

    return {
        success: true,
        content: newContent
    }
}

// ------------------------------------------------------------------
// 4. Generate Job Document
// ------------------------------------------------------------------

export async function generateJobDocument(
    jobId: string,
    documentType: DocumentType
): Promise<{ success: boolean; documentId: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Fetch job data
    const { data: job } = await supabase
        .from('job_applications')
        .select('*, current_resume_version_id')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        throw new Error('Job not found')
    }

    // Fetch resume content
    const { data: resumeVersion } = await supabase
        .from('resume_versions')
        .select('content')
        .eq('id', job.current_resume_version_id)
        .single()

    if (!resumeVersion) {
        throw new Error('Resume version not found')
    }

    // Extract resume text
    const resumeContent = resumeVersion.content?.raw_text ||
        JSON.stringify(resumeVersion.content)

    // Generate content using AI
    const content = await regenerateDocument({
        document_type: documentType,
        job_title: job.job_title,
        company_name: job.company_name,
        resume_content: resumeContent,
        job_description: job.job_description
    })

    // Create document
    const { data: newDoc, error: insertError } = await supabase
        .from('documents')
        .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            type: documentType,
            title: `${documentType.replace('_', ' ')} - ${job.company_name}`,
            content: content,
            status: 'active'
        })
        .select()
        .single()

    if (insertError) {
        console.error('Database Insert Error:', insertError)
    }

    if (!newDoc) {
        console.error('Failed to create new document, data is null. Insert error:', insertError)
        throw new Error(`Failed to create document: ${insertError?.message || 'Unknown DB error'}`)
    }

    // Check if job_document entry exists
    const { data: existingJobDoc } = await supabase
        .from('job_documents')
        .select('id')
        .eq('job_id', jobId)
        .eq('document_type', documentType)
        .maybeSingle()

    if (existingJobDoc) {
        // Update existing entry
        await supabase
            .from('job_documents')
            .update({
                document_id: newDoc.id,
                status: 'ready' as DocumentStatus,
                status_reason: null,
                generated_at: new Date().toISOString(),
                last_updated_at: new Date().toISOString(),
                depends_on_resume_version_id: job.current_resume_version_id
            })
            .eq('id', existingJobDoc.id)

        // Create status event
        await supabase
            .from('document_status_events')
            .insert({
                job_document_id: existingJobDoc.id,
                old_status: 'missing' as DocumentStatus,
                new_status: 'ready' as DocumentStatus,
                reason: 'Document generated',
                triggered_by: 'user'
            })
    } else {
        // Create new job_document entry
        const { data: newJobDoc } = await supabase
            .from('job_documents')
            .insert({
                job_id: jobId,
                document_id: newDoc.id,
                document_type: documentType,
                status: 'ready' as DocumentStatus,
                priority: documentType === 'cover_letter' ? 'required' : 'optional',
                generated_at: new Date().toISOString(),
                last_updated_at: new Date().toISOString(),
                depends_on_resume_version_id: job.current_resume_version_id
            })
            .select()
            .single()

        if (newJobDoc) {
            // Create status event
            await supabase
                .from('document_status_events')
                .insert({
                    job_document_id: newJobDoc.id,
                    old_status: null,
                    new_status: 'ready' as DocumentStatus,
                    reason: 'Document generated',
                    triggered_by: 'user'
                })
        }
    }

    revalidatePath(`/dashboard/jobs/${jobId}`)

    return {
        success: true,
        documentId: newDoc.id
    }
}

// ------------------------------------------------------------------
// 5. Fetch User Resumes (for selector)
// ------------------------------------------------------------------

export async function fetchUserResumes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data: resumes } = await supabase
        .from('resumes')
        .select(`
            id,
            title,
            created_at,
            versions:resume_versions(
                id,
                version_number,
                created_at
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return resumes || []
}
