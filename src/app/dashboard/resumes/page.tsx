import { createClient } from '@/lib/supabase/server'
import ResumesClient, { ResumeWithStats } from './ResumesClient'

export default async function ResumesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Call the new RPC function for efficient stats
    const { data: stats, error } = await supabase
        .rpc('get_resume_stats', { userid: user.id })

    if (error) {
        console.error('Failed to fetch resume stats:', error)
        // Fallback or error state
        return <div className="p-8 text-center text-red-600">Failed to load resume data. Please try again.</div>
    }

    // Map RPC result to Client Component Interface
    const finalResumes: ResumeWithStats[] = (stats || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        created_at: r.created_at,
        current_version_number: r.current_version_number,
        analysisStatus: r.analysis_status || 'pending',
        analysisError: r.analysis_error,
        stats: {
            applicationsCount: Number(r.applications_count),
            interviewCount: Number(r.interview_count),
            atsScoreAvg: Number(r.ats_score_avg),
            topStrengths: r.top_strengths || []
        }
    }))

    // Determine Best Resume Logic
    let bestResume: ResumeWithStats | null = null;
    let highImpactScore = -1;

    for (const r of finalResumes) {
        const interviewRate = r.stats.applicationsCount > 0 ? (r.stats.interviewCount / r.stats.applicationsCount) : 0
        const impactScore = (interviewRate * 100) + (r.stats.atsScoreAvg * 0.5)

        if (impactScore > highImpactScore) {
            highImpactScore = impactScore
            bestResume = r
        }
    }

    if (bestResume && (bestResume.stats.applicationsCount === 0 && bestResume.stats.atsScoreAvg === 0)) {
        bestResume = null
    }

    return (
        <ResumesClient resumes={finalResumes} bestResume={bestResume} />
    )
}
