import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { InterviewPrepView } from '@/components/jobs/InterviewPrepView'

export default async function JobInterviewPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    const { data: job } = await supabase
        .from('job_applications')
        .select('interview_prep_json')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto">
            <InterviewPrepView prep={job.interview_prep_json as any} jobId={id} />
        </div>
    )
}
