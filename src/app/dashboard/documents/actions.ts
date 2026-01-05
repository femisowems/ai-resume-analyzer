'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
// import { generateCoverLetter, generateThankYouEmail, optimizeLinkedIn } from '@/lib/openai'
import { DocumentAnalysis, JobStatus } from '@/lib/types'

// --- Types ---

export type DocumentItem = {
    id: string
    type: 'cover_letter' | 'thank_you' | 'linkedin' | 'resume'
    title?: string
    content?: string
    createdAt: string
    downloadUrl?: string

    // Intelligence & Status
    status: 'draft' | 'active' | 'archived' | 'template'
    aiAnalysis?: DocumentAnalysis

    // Usage / Activity
    lastUsedAt?: string
    reuseCount?: number

    // Linked Jobs (Unified)
    links: {
        jobId: string
        companyName: string
        jobTitle: string
        status: JobStatus
    }[]

    // Backwards compatibility / Top-level checks
    companyName?: string
    jobTitle?: string
}

export type LinkableJob = {
    id: string
    companyName: string
    jobTitle: string
    status: string
    createdAt: string
}

// --- Actions ---

export async function createDocument(
    type: 'cover_letter' | 'thank_you' | 'linkedin',
    content: string,
    jobId?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const docId = crypto.randomUUID()

    // 1. Create Document
    const { error } = await supabase
        .from('documents')
        .insert({
            id: docId,
            user_id: user.id,
            // job_application_id is deprecated in favor of links, but we can keep it null or migrated
            type,
            content,
            title: `${type === 'cover_letter' ? 'Cover Letter' : type === 'thank_you' ? 'Thank You Email' : 'LinkedIn Post'} - ${new Date().toLocaleDateString()}`,
            status: jobId ? 'active' : 'draft',
            last_used_at: new Date().toISOString(),
            reuse_count: jobId ? 1 : 0
        })

    if (error) {
        console.error('SERVER ACTION ERROR:', error)
        throw new Error(error.message || 'Failed to save document')
    }

    // 2. Create Link if jobId provided
    if (jobId) {
        await linkDocumentToJob(docId, jobId)
    }

    revalidatePath('/dashboard/documents')
    if (jobId) {
        revalidatePath(`/dashboard/jobs/${jobId}`)
    }
}

export async function linkDocumentToJob(documentId: string, jobId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('document_job_links')
        .insert({
            document_id: documentId,
            job_application_id: jobId
        })
        .select()

    if (error) {
        // Ignore duplicate key errors if already linked
        if (error.code !== '23505') {
            console.error('Failed to link document:', error)
            throw new Error('Failed to link document to job')
        }
    }

    // Update document stats
    // Note: If RPC doesn't exist yet, we can simple update directly or ignore. 
    // For now manual update:
    await supabase
        .from('documents')
        .update({
            last_used_at: new Date().toISOString(),
            status: 'active'
        })
        .eq('id', documentId)

    revalidatePath('/dashboard/documents')
}

export async function getLinkableJobs(): Promise<LinkableJob[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('job_applications')
        .select('id, company_name, job_title, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    return (data || []).map((job: any) => ({
        id: job.id,
        companyName: job.company_name,
        jobTitle: job.job_title,
        status: job.status,
        createdAt: job.created_at
    }))
}

export async function getDocuments(jobId?: string): Promise<DocumentItem[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // 1. Fetch Generated Documents with Links
    let docQuery = supabase
        .from('documents')
        .select(`
            id,
            type,
            content,
            created_at,
            status,
            ai_analysis,
            last_used_at,
            reuse_count,
            document_job_links(
                job_application:job_applications(
                    id,
                    company_name,
                    job_title,
                    status
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Note: Filtering by jobId for specific job view requires modification if we use links
    // But for the Documents Hub (jobId undefined), we want all.
    // If jobId IS defined (e.g. "Select Document for this Job" modal), we filters 
    // But current requirement is Main List.
    // If filter needed: 
    if (jobId) {
        // This is trickier with many-to-many. 
        // We would need to filter where document_job_links contains jobId
        // Supabase/PostgREST syntax: !inner join
        docQuery = supabase
            .from('documents')
            .select(`..., document_job_links!inner(...)`)
            .eq('document_job_links.job_application_id', jobId) as any
    }

    const { data: generatedDocs } = await docQuery

    // 2. Fetch Resumes with versions and implicit job links
    const { data: resumes, error: resumeError } = await supabase
        .from('resumes')
        .select(`
            id,
            title,
            created_at,
            raw_file_path,
            current_version_id,
            resume_versions(
                id,
                content,
                job_applications!job_applications_resume_version_id_fkey(
                    id,
                    company_name,
                    job_title,
                    status
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (resumeError) {
        console.error('Error fetching resumes:', resumeError)
    }


    // 3. Normalize and Combine
    const unifiedDocs: DocumentItem[] = []

    generatedDocs?.forEach((doc: any) => {
        const links = doc.document_job_links?.map((link: any) => ({
            jobId: link.job_application.id,
            companyName: link.job_application.company_name,
            jobTitle: link.job_application.job_title,
            status: link.job_application.status
        })) || []

        // If jobId argument was passed, we only want docs linked to it? 
        // Or if we are in the dashboard, we show all links.

        unifiedDocs.push({
            id: doc.id,
            type: doc.type,
            content: doc.content,
            title: doc.type === 'cover_letter' ? 'Cover Letter' : 'Document', // Default, overridden by implicit title in DB if strictly followed but we construct it usually
            // Actually documents table doesn't have title column in previous schema? 
            // Wait, createDocument inserts 'title'.
            // Let's assume schema has title (it wasn't in my migration but createDocument used it)
            // Checking previous file content... yes insert had title.
            // I should select title.
            // ... adding title to select above ...

            createdAt: doc.created_at,
            status: doc.status || 'draft',
            aiAnalysis: doc.ai_analysis,
            lastUsedAt: doc.last_used_at,
            reuseCount: doc.reuse_count || 0,
            links: links,
            // Backwards compat mainly for display if needed
            companyName: links[0]?.companyName,
            jobTitle: links[0]?.jobTitle,
        })
    })

    // Process Resumes
    if (resumes) {
        for (const resume of resumes) {
            let downloadUrl = undefined
            let content = undefined

            // Find current version
            const currentVer = resume.resume_versions?.find((v: any) => v.id === resume.current_version_id)

            if (currentVer) {
                content = currentVer.content?.raw_text || currentVer.content?.text
            }

            // Implicit links via versions
            // Collect all job applications from all versions of this resume (or just current?)
            // Usually "Resume Usage" means any version.
            const allLinks: any[] = []
            resume.resume_versions?.forEach((v: any) => {
                if (v.job_applications) {
                    v.job_applications.forEach((job: any) => {
                        allLinks.push({
                            jobId: job.id,
                            companyName: job.company_name,
                            jobTitle: job.job_title,
                            status: job.status
                        })
                    })
                }
            })

            // Dedup links
            const uniqueLinks = Array.from(new Map(allLinks.map(item => [item.jobId, item])).values())

            if (resume.raw_file_path) {
                const { data } = await supabase.storage
                    .from('resumes')
                    .createSignedUrl(resume.raw_file_path, 3600)
                downloadUrl = data?.signedUrl
            }

            unifiedDocs.push({
                id: resume.id,
                type: 'resume',
                title: resume.title,
                content: content,
                createdAt: resume.created_at,
                downloadUrl,
                status: uniqueLinks.length > 0 ? 'active' : 'draft',
                links: uniqueLinks as any,
                reuseCount: uniqueLinks.length
            })
        }
    }

    return unifiedDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getDocument(id: string): Promise<DocumentItem | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Try fetching from documents (text/AI docs)
    const { data: doc } = await supabase
        .from('documents')
        .select(`
            id, type, content, created_at, status, ai_analysis, last_used_at, reuse_count, title,
            document_job_links(
                job_application:job_applications(
                    id, company_name, job_title, status
                )
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (doc) {
        const links = doc.document_job_links?.map((link: any) => ({
            jobId: link.job_application.id,
            companyName: link.job_application.company_name,
            jobTitle: link.job_application.job_title,
            status: link.job_application.status
        })) || []

        return {
            id: doc.id,
            type: doc.type,
            content: doc.content,
            title: doc.title || (doc.type === 'cover_letter' ? 'Cover Letter' : 'Document'),
            createdAt: doc.created_at,
            status: doc.status || 'draft',
            aiAnalysis: doc.ai_analysis,
            lastUsedAt: doc.last_used_at,
            reuseCount: doc.reuse_count || 0,
            links: links,
            companyName: links[0]?.companyName,
            jobTitle: links[0]?.jobTitle,
        }
    }

    // 2. Try fetching from resumes
    const { data: resume } = await supabase
        .from('resumes')
        .select(`
            id, title, created_at, raw_file_path, current_version_id,
            resume_versions(
                id, content,
                job_applications!job_applications_resume_version_id_fkey(
                    id, company_name, job_title, status
                )
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (resume) {
        let downloadUrl = undefined
        let content = undefined
        const currentVer = resume.resume_versions?.find((v: any) => v.id === resume.current_version_id)

        if (currentVer) {
            content = currentVer.content?.raw_text || currentVer.content?.text
        }

        if (resume.raw_file_path) {
            const { data } = await supabase.storage
                .from('resumes')
                .createSignedUrl(resume.raw_file_path, 3600)
            downloadUrl = data?.signedUrl
        }

        const allLinks: any[] = []
        resume.resume_versions?.forEach((v: any) => {
            if (v.job_applications) {
                v.job_applications.forEach((job: any) => {
                    allLinks.push({
                        jobId: job.id,
                        companyName: job.company_name,
                        jobTitle: job.job_title,
                        status: job.status
                    })
                })
            }
        })
        const uniqueLinks = Array.from(new Map(allLinks.map(item => [item.jobId, item])).values())

        return {
            id: resume.id,
            type: 'resume',
            title: resume.title,
            content: content,
            createdAt: resume.created_at,
            downloadUrl,
            status: uniqueLinks.length > 0 ? 'active' : 'draft',
            links: uniqueLinks as any,
            reuseCount: uniqueLinks.length
        }
    }

    return null
}

export async function deleteDocument(id: string, type?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    if (type === 'resume') {
        const { data: resume } = await supabase
            .from('resumes')
            .select('raw_file_path')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (resume?.raw_file_path) {
            await supabase.storage
                .from('resumes')
                .remove([resume.raw_file_path])
        }

        const { error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw new Error(error.message)
    } else {
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw new Error(error.message)
    }

    revalidatePath('/dashboard/documents')
}

// Keep existing generators but ensure they check for linking if needed or just return text
import { generateCoverLetterWithGemini, generateThankYouEmailWithGemini, optimizeLinkedInWithGemini } from '@/lib/gemini'

// ...

export async function generateCoverLetterAction(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: job } = await supabase
        .from('job_applications')
        .select('*, resume_version:resume_versions(*)')
        .eq('id', jobId)
        .single()

    if (!job || !job.resume_version) throw new Error('Job or resume not found')

    const content = job.resume_version.content || {}
    const resumeText = content.text || content.raw_text || ''

    if (!resumeText) throw new Error('Resume text is missing.')

    return generateCoverLetterWithGemini(
        resumeText,
        job.job_title,
        job.company_name,
        job.job_description || '',
        new Date().toLocaleDateString(),
        job.notes
    )
}

export async function generateThankYouAction(
    jobId: string,
    interviewerName: string,
    interviewDate: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: job } = await supabase
        .from('job_applications')
        .select('*, resume_version:resume_versions(*)')
        .eq('id', jobId)
        .single()

    if (!job || !job.resume_version) throw new Error('Job or resume not found')

    const content = job.resume_version.content || {}
    const resumeText = content.text || content.raw_text || ''

    return generateThankYouEmailWithGemini(
        resumeText,
        job.job_title,
        job.company_name,
        interviewerName,
        interviewDate,
        job.notes
    )
}

export async function generateLinkedInAction(resumeId: string, targetRole: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: resume } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('id', resumeId)
        .single()

    if (!resume) throw new Error('Resume not found')

    const resumeText = resume.content?.text || resume.content?.raw_text || ''
    return optimizeLinkedInWithGemini(resumeText, targetRole)
}

export async function updateDocument(id: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('documents')
        .update({
            content,
            last_used_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Update failed', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/documents')
}
