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
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Header is handled by the layout or inside JobBoard. 
                We want full height for the board. 
             */}
            <div className="h-full p-6 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs</h1>
                        <p className="text-slate-500 text-sm">Track and manage your applications</p>
                    </div>
                    <Link href="/dashboard/jobs/new" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center">
                        + Track New Job
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden">
                    <JobBoard initialJobs={jobs} />
                </div>
            </div>
        </div>
    )
}
