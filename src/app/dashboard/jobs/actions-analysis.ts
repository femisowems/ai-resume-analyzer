'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { analyzeJobMatch, generateInterviewPrep, generateNextBestAction, JobMatchAnalysis, NextBestAction, InterviewPrepData } from '@/lib/gemini-jobs'
import { JobExtended } from '@/lib/types'

export async function triggerJobAnalysis(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Fetch Job + Resume
    const { data: job } = await supabase
        .from('job_applications')
        .select(`
            *,
            resume_version:resume_versions(
                id,
                content
            )
        `)
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

    if (!job) throw new Error('Job not found')

    const resumeContent = (job.resume_version?.content as any)?.raw_text || "No resume text available."
    const jobDescription = job.notes || job.description || "No job description available."

    // Run Analysis
    const analysis: JobMatchAnalysis = await analyzeJobMatch(resumeContent, jobDescription)

    // Compute Next Best Action while we are at it
    const nextAction: NextBestAction = await generateNextBestAction({
        status: job.status,
        days_in_stage: 0, // simplistic for now
        match_score: analysis.match_score,
        last_activity_type: 'analysis_run'
    })

    // Update DB
    await supabase
        .from('job_applications')
        .update({
            match_analysis_json: analysis,
            match_score: analysis.match_score,
            next_action_json: nextAction,
            updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

    // Log activity
    await supabase.from('job_timeline_events').insert({
        job_id: jobId,
        event_type: 'document_created', // loosely fits
        title: 'Full Analysis Ran',
        description: `Match Score: ${analysis.match_score}%`
    })

    revalidatePath(`/dashboard/jobs/${jobId}/match`)
    revalidatePath(`/dashboard/jobs/${jobId}`)
}

export async function triggerInterviewPrep(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: job } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

    if (!job) throw new Error('Job not found')

    const prepData: InterviewPrepData = await generateInterviewPrep(
        job.job_title,
        job.company_name,
        job.notes || job.description || ""
    )

    await supabase
        .from('job_applications')
        .update({
            interview_prep_json: prepData,
            updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

    await supabase.from('job_timeline_events').insert({
        job_id: jobId,
        event_type: 'stage_change', // loosely fits
        title: 'Interview Prep Generated',
        description: 'Questions and notes created'
    })

    revalidatePath(`/dashboard/jobs/${jobId}/interview`)
}

export async function refreshNextAction(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: job } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', jobId)
        .single()

    // Calculate days
    const created = new Date(job.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const nextAction = await generateNextBestAction({
        status: job.status,
        days_in_stage: diffDays,
        match_score: job.match_score,
        last_activity_type: 'check_in'
    })

    await supabase
        .from('job_applications')
        .update({
            next_action_json: nextAction
        })
        .eq('id', jobId)

    revalidatePath(`/dashboard/jobs/${jobId}`)
}
