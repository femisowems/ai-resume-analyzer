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
