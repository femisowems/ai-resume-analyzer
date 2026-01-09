import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { MatchAnalysisView } from '@/components/jobs/MatchAnalysisView'

export default async function JobMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    const { data: job } = await supabase
        .from('job_applications')
        .select('match_analysis_json, resume_version_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        notFound()
    }

    // Safely fetch related resume ID if linked
    let resumeId: string | undefined = undefined;
    if (job.resume_version_id) {
        const { data: version } = await supabase
            .from('resume_versions')
            .select('resume_id')
            .eq('id', job.resume_version_id)
            .maybeSingle()

        if (version) {
            resumeId = version.resume_id
        }
    }

    return (
        <div className="max-w-l mx-auto">
            <MatchAnalysisView
                analysis={job.match_analysis_json as any}
                jobId={id}
                resumeId={resumeId}
            />
        </div>
    )
}
