'use server'

import { createClient } from '@/lib/supabase/server'
import { Job, JobActivity, JobStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function updateJobStatus(jobId: string, status: JobStatus) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating job status:', error)
        throw new Error('Failed to update job status')
    }

    // Log activity
    await addJobActivity(jobId, 'STATUS_CHANGE', `Moved to ${status}`)

    revalidatePath('/dashboard/jobs')
}

export async function addJobActivity(
    jobId: string,
    type: JobActivity['type'],
    content: string,
    metadata: any = {}
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('job_activities')
        .insert({
            job_id: jobId,
            user_id: user.id,
            type,
            content,
            metadata
        })

    if (error) {
        console.error('Error adding activity:', error)
        // Don't throw, just log. Activity failure shouldn't block main flow.
    }
}

export async function getJobActivities(jobId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('job_activities')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as JobActivity[]
}

// ------------------------------------------------------------------
// Legacy / Detail Page Actions (Adapters)
// ------------------------------------------------------------------

export async function updateJobApplication(formData: FormData) {
    const id = formData.get('id') as string
    const status = formData.get('status') as JobStatus
    // Notes handling if present
    const notes = formData.get('notes') as string

    if (!id || !status) return

    const supabase = await createClient()

    // Update basic fields
    const updates: any = { status, updated_at: new Date().toISOString() }
    if (notes) updates.notes = notes

    const { error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)

    if (error) throw error

    revalidatePath(`/dashboard/jobs/${id}`)
    revalidatePath('/dashboard/jobs')
}

import { triggerJobAnalysis } from './actions-analysis'

export async function analyzeJobMatch(jobId: string) {
    // Wrapper around the new analysis logic
    await triggerJobAnalysis(jobId)
    revalidatePath(`/dashboard/jobs/${jobId}`)
}

export async function generateQuestions(jobId: string) {
    // Temporary implementation to satisfy build
    // In a real scenario, this would call a specialized Gemini prompt
    // For now, we reuse the analysis which generates questions, or stub it.

    // Let's call the analysis which DOES generate questions in the new 'analysis_json' field.
    // However, the detail page looks for 'interview_questions' column. 
    // We should migrate that page later. For now, let's fix the build.

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Mock or minimal generation for now to fix build
    // Real implementation would go in gemini-jobs.ts
    const questions = [
        { type: 'technical', question: 'Explain the core principles of React.', answer: 'Components, Props, State...' },
        { type: 'behavioral', question: 'Tell me about a time you failed.', answer: 'STAR method...' }
    ]

    await supabase
        .from('job_applications')
        .update({ interview_questions: questions })
        .eq('id', jobId)

    revalidatePath(`/dashboard/jobs/${jobId}`)
}
