import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { JobDescriptionEditor } from '@/components/jobs/JobDescriptionEditor'

export default async function JobDescriptionPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    const { data: job } = await supabase
        .from('job_applications')
        .select('id, description:job_description')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        notFound()
    }

    return (
        <div className="max-w-l mx-auto py-8">
            <JobDescriptionEditor
                jobId={job.id}
                initialDescription={job.description || undefined}
            />
        </div>
    )
}
