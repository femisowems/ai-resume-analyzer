import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JobBoard from './JobBoard'

export default async function JobsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    const { data: jobs } = await supabase
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

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Job Applications</h1>
            <JobBoard initialJobs={jobs || []} />
        </div>
    )
}
