import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JobBoard from './JobBoard'

export default async function JobsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    // Fetch jobs with expanded fields
    const { data: rawJobs } = await supabase
        .from('job_applications')
        .select(`
            *,
            resume_version:resume_versions(
                resume:resumes(
                    title
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Normalize and Cast
    const jobs = (rawJobs || []).map((job: any) => ({
        ...job,
        // Ensure status matches our enum (uppercase)
        status: job.status ? job.status.toUpperCase() : 'SAVED',
        // Ensure arrays are arrays (Supabase might return null for empty json)
        stage_specifics: job.stage_specifics || {},
        analysis_json: job.analysis_json || null
    }))

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden">
            <JobBoard initialJobs={jobs} />
        </div>
    )
}
