'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJobApplication(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const company_name = formData.get('company_name') as string
    const job_title = formData.get('job_title') as string
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const resume_id = formData.get('resume_id') as string

    let resume_version_id = null

    // If a resume is selected, find its current version
    if (resume_id) {
        const { data: resume } = await supabase
            .from('resumes')
            .select('current_version_id')
            .eq('id', resume_id)
            .single()

        if (resume) {
            resume_version_id = resume.current_version_id
        }
    }

    const { error } = await supabase
        .from('job_applications')
        .insert({
            user_id: user.id,
            company_name,
            job_title,
            status,
            notes,
            resume_version_id,
            applied_date: new Date().toISOString()
        })

    if (error) {
        console.error('Job Create Error:', error)
        throw new Error('Failed to create job application')
    }

    revalidatePath('/dashboard/jobs')
    redirect('/dashboard/jobs')
}

export async function updateJobApplication(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const id = formData.get('id') as string
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const resume_id = formData.get('resume_id') as string

    const updateData: any = {
        status,
        notes,
        updated_at: new Date().toISOString()
    }

    // If resume_id is provided, find its current version
    if (resume_id) {
        const { data: resume } = await supabase
            .from('resumes')
            .select('current_version_id')
            .eq('id', resume_id)
            .single()

        if (resume) {
            updateData.resume_version_id = resume.current_version_id
        }
    }

    const { error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Update Error:', error)
        throw new Error('Failed to update job application')
    }

    revalidatePath(`/dashboard/jobs/${id}`)
    revalidatePath('/dashboard/jobs')
}

import { matchResumeToJob } from '@/lib/openai'

export async function analyzeJobMatch(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Fetch Job & Linked Resume
    const { data: job } = await supabase
        .from('job_applications')
        .select(`
            *,
            resume_version:resume_versions(
                content
            )
        `)
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

    if (!job || !job.resume_version) {
        throw new Error('Job not found or no resume linked')
    }

    const content = job.resume_version.content || {}
    const resumeText = content.text || content.raw_text || ''
    const jobDescription = job.job_description || job.notes || ''

    if (!resumeText) {
        throw new Error('Resume text is missing. Please check if the resume was parsed correctly.')
    }
    if (!jobDescription) {
        throw new Error('Job Description is missing. Please add a description or notes to the job.')
    }

    try {
        const matchResult = await matchResumeToJob(resumeText, jobDescription)

        const { error } = await supabase
            .from('job_applications')
            .update({
                match_score: matchResult.score,
                match_analysis: matchResult
            })
            .eq('id', jobId)

        if (error) throw error

    } catch (e) {
        console.error("Match Error", e)
        throw new Error("Failed to analyze match")
    }

    revalidatePath(`/dashboard/jobs/${jobId}`)
}

import { generateInterviewQuestions } from '@/lib/openai'

export async function generateQuestions(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data: job } = await supabase
        .from('job_applications')
        .select(`*, resume_version:resume_versions(content)`)
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

    if (!job || !job.resume_version) throw new Error('Job or Resume not found')

    // Check if questions already exist to avoid re-generating (optional check, but good for cost)
    // if (job.interview_questions) return; 

    // Use job.notes as description since we use that for context
    const content = job.resume_version.content || {}
    const resumeText = content.text || content.raw_text || ''
    const jobDescription = job.job_description || job.notes || ''

    if (!resumeText) throw new Error('Resume text is missing')
    if (!jobDescription) throw new Error('Job description is missing')

    try {
        const questions = await generateInterviewQuestions(resumeText, jobDescription)

        const { error } = await supabase
            .from('job_applications')
            .update({ interview_questions: questions })
            .eq('id', jobId)

        if (error) throw error

    } catch (e) {
        console.error("Gen Questions Error", e)
        throw new Error("Failed to generate questions")
    }

    revalidatePath(`/dashboard/jobs/${jobId}`)
}
