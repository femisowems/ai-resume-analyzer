import { createClient } from '@/lib/supabase/server'
import ResumesClient, { ResumeWithStats } from './ResumesClient'

export default async function ResumesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. Get Resumes
    const { data: resumes } = await supabase
        .from('resumes')
        .select(`
            *,
            current_version:resume_versions(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (!resumes) return <div>Failed to load resumes</div>

    // 2. Get Job Applications to calculate stats
    const { data: applications } = await supabase
        .from('job_applications')
        .select('id, status, match_score, resume_version_id')
        .eq('user_id', user.id)

    // 3. Aggregate Stats
    // Define internal type for calculation
    type ResumeCalc = {
        id: string
        title: string
        created_at: string
        current_version_number: number
        stats: {
            applicationsCount: number
            interviewCount: number
            atsScoreAvg: number
            scores: number[]
            topStrengths: string[]
        }
    }

    const resumeStats: ResumeCalc[] = resumes.map(resume => {
        return {
            id: resume.id,
            title: resume.title,
            created_at: resume.created_at,
            current_version_number: resume.current_version?.[0]?.version_number || 1,
            stats: {
                applicationsCount: 0,
                interviewCount: 0,
                atsScoreAvg: 0,
                scores: [] as number[],
                topStrengths: (resume.current_version?.[0]?.analysis_result?.strengths || []) as string[]
            }
        }
    })

    // To properly map apps to resumes, we need a map of version_id -> resume_id
    const { data: allVersions } = await supabase
        .from('resume_versions')
        .select('id, resume_id')

    const versionMap = new Map<string, string>();
    allVersions?.forEach(v => versionMap.set(v.id, v.resume_id))

    // Fill Stats
    applications?.forEach(app => {
        if (!app.resume_version_id) return
        const resumeId = versionMap.get(app.resume_version_id)
        if (!resumeId) return

        const resume = resumeStats.find(r => r.id === resumeId)
        if (resume) {
            resume.stats.applicationsCount++
            const s = app.status?.toLowerCase() || ''
            if (['interview', 'offer', 'hired', 'interviewing'].some(k => s.includes(k))) {
                resume.stats.interviewCount++
            }
            if (app.match_score) {
                resume.stats.scores.push(app.match_score)
            }
        }
    })

    // Final calculations
    resumeStats.forEach(r => {
        if (r.stats.scores.length > 0) {
            const total = r.stats.scores.reduce((a, b) => a + b, 0)
            r.stats.atsScoreAvg = Math.round(total / r.stats.scores.length)
        }

        // Fallback to analysis score
        if (r.stats.atsScoreAvg === 0) {
            const original = resumes.find(orig => orig.id === r.id)
            if (original?.current_version?.[0]?.analysis_result?.score) {
                r.stats.atsScoreAvg = original.current_version[0].analysis_result.score
            }
        }
    })

    // 4. Determine Best Resume
    let bestResume: ResumeCalc | null = null;
    let highImpactScore = -1;

    resumeStats.forEach((r) => {
        const interviewRate = r.stats.applicationsCount > 0 ? (r.stats.interviewCount / r.stats.applicationsCount) : 0
        const impactScore = (interviewRate * 100) + (r.stats.atsScoreAvg * 0.5)

        if (impactScore > highImpactScore) {
            highImpactScore = impactScore
            bestResume = r
        }
    })

    // Map to Client Interface (removing 'scores')
    const finalResumes: ResumeWithStats[] = resumeStats.map(r => ({
        id: r.id,
        title: r.title,
        created_at: r.created_at,
        current_version_number: r.current_version_number,
        stats: {
            applicationsCount: r.stats.applicationsCount,
            interviewCount: r.stats.interviewCount,
            atsScoreAvg: r.stats.atsScoreAvg,
            topStrengths: r.stats.topStrengths
        }
    }))

    let finalBestResume: ResumeWithStats | null = null
    if (bestResume && (bestResume.stats.applicationsCount > 0 || bestResume.stats.atsScoreAvg > 0)) {
        const bestId = bestResume.id
        finalBestResume = finalResumes.find(r => r.id === bestId) || null
    }

    return (
        <ResumesClient resumes={finalResumes} bestResume={finalBestResume} />
    )
}
