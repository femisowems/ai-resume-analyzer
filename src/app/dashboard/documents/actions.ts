'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateCoverLetter, generateThankYouEmail, optimizeLinkedIn } from '@/lib/openai'

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

    // Use standard client with refined RLS
    const { error } = await supabase
        .from('documents')
        .insert({
            id: crypto.randomUUID(), // Explicit ID generation
            user_id: user.id,
            job_application_id: jobId || null,
            type,
            content,
            title: `${type === 'cover_letter' ? 'Cover Letter' : type === 'thank_you' ? 'Thank You Email' : 'LinkedIn Post'} - ${new Date().toLocaleDateString()}`,
        })

    if (error) {
        console.error('SERVER ACTION ERROR:', error)
        throw new Error(error.message || 'Failed to save document')
    }

    revalidatePath('/dashboard/documents')
    if (jobId) {
        revalidatePath(`/dashboard/jobs/${jobId}`)
    }
}


export type DocumentItem = {
    id: string
    type: 'cover_letter' | 'thank_you' | 'linkedin' | 'resume'
    title?: string // For resumes or generic titles
    content?: string // For text docs
    companyName?: string
    jobTitle?: string
    createdAt: string
    downloadUrl?: string // For resumes
}

export async function getDocuments(jobId?: string): Promise<DocumentItem[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // 1. Fetch Generated Documents with Job Details
    let docQuery = supabase
        .from('documents')
        .select(`
            *,
            job_application:job_applications(
                company_name,
                job_title
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (jobId) {
        docQuery = docQuery.eq('job_application_id', jobId)
    }

    const { data: generatedDocs } = await docQuery

    // 2. Fetch Resumes (only if no jobId is specified, or if we want to show resumes related to a job - but resumes aren't strictly 1:1 with jobs in this schema easily without join. 
    // For now, let's only show resumes if NO jobId is passed, i.e., the main documents list)
    let resumes: any[] = []
    if (!jobId) {
        const { data } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        resumes = data || []
    }

    // 3. Normalize and Combine
    const unifiedDocs: DocumentItem[] = []

    generatedDocs?.forEach((doc: any) => {
        unifiedDocs.push({
            id: doc.id,
            type: doc.type,
            content: doc.content,
            companyName: doc.job_application?.company_name,
            jobTitle: doc.job_application?.job_title,
            createdAt: doc.created_at
        })
    })

    const resumePromises = resumes.map(async (resume: any) => {
        let downloadUrl = undefined
        if (resume.raw_file_path) {
            const { data } = await supabase.storage
                .from('resumes')
                .createSignedUrl(resume.raw_file_path, 3600) // 1 hour expiry
            downloadUrl = data?.signedUrl
        }

        return {
            id: resume.id,
            type: 'resume' as const,
            title: resume.title,
            createdAt: resume.created_at,
            downloadUrl
        }
    })

    const processedResumes = await Promise.all(resumePromises)
    unifiedDocs.push(...processedResumes)

    // Sort combined list by date descending
    return unifiedDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function deleteDocument(id: string, type?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    if (type === 'resume') {
        // Fetch resume to get valid file path
        const { data: resume } = await supabase
            .from('resumes')
            .select('raw_file_path')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (resume?.raw_file_path) {
            // Delete file from storage
            await supabase.storage
                .from('resumes')
                .remove([resume.raw_file_path])
        }

        // Delete from database
        const { error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('SERVER ACTION ERROR:', error)
            throw new Error(error.message || 'Failed to delete resume')
        }
    } else {
        // Delete generated document
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('SERVER ACTION ERROR:', error)
            throw new Error(error.message || 'Failed to delete document')
        }
    }

    revalidatePath('/dashboard/documents')
}

export async function generateCoverLetterAction(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Fetch job details
    const { data: job } = await supabase
        .from('job_applications')
        .select('*, resume_version:resume_versions(*)')
        .eq('id', jobId)
        .single()

    if (!job || !job.resume_version) {
        throw new Error('Job or resume not found')
    }

    const resumeText = job.resume_version.content?.text || ''
    const coverLetter = await generateCoverLetter(
        resumeText,
        job.job_title,
        job.company_name,
        job.job_description || ''
    )

    return coverLetter
}

export async function generateThankYouAction(
    jobId: string,
    interviewerName: string,
    interviewDate: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: job } = await supabase
        .from('job_applications')
        .select('*, resume_version:resume_versions(*)')
        .eq('id', jobId)
        .single()

    if (!job || !job.resume_version) {
        throw new Error('Job or resume not found')
    }

    const resumeText = job.resume_version.content?.text || ''

    const thankYou = await generateThankYouEmail(
        resumeText,
        job.job_title,
        job.company_name,
        interviewerName,
        interviewDate
    )

    return thankYou
}

export async function generateLinkedInAction(resumeId: string, targetRole: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: resume } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('id', resumeId)
        .single()

    if (!resume) {
        throw new Error('Resume not found')
    }

    const resumeText = resume.content?.text || ''
    const optimization = await optimizeLinkedIn(resumeText, targetRole)

    return optimization
}
