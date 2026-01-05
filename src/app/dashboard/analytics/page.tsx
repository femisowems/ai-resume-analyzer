import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    // Fetch all job applications
    const { data: jobs } = await supabase
        .from('job_applications')
        .select('id, status, created_at, match_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (!jobs) {
        return <div>Failed to load analytics</div>
    }

    // --- Calculate KPIs ---

    const totalApplications = jobs.length

    // Status definitions (simplified for matching)
    const interviewStatuses = ['INTERVIEW', 'OFFER', 'HIRED', 'INTERVIEWING']
    const rejectedStatuses = ['REJECTED', 'GHOSTED']
    const activePipelineCount = jobs.filter(j =>
        !rejectedStatuses.includes(j.status?.toUpperCase()) &&
        !['HIRED'].includes(j.status?.toUpperCase()) // Hired is success, not "pipeline"
    ).length

    const interviews = jobs.filter(j => interviewStatuses.includes(j.status?.toUpperCase())).length
    const responses = jobs.filter(j =>
        interviewStatuses.includes(j.status?.toUpperCase()) ||
        j.status?.toUpperCase() === 'REJECTED'
    ).length

    const interviewRate = totalApplications > 0 ? interviews / totalApplications : 0
    const responseRate = totalApplications > 0 ? responses / totalApplications : 0

    // --- Calculate Activity (Last 30 Days) ---

    const activityMap = new Map<string, number>()
    const today = new Date()

    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        // Format: MM-DD
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        activityMap.set(key, 0)
    }

    // Fill with data
    jobs.forEach(job => {
        const jobDate = new Date(job.created_at)
        // Only count if within last 30 days (rough check)
        const diffTime = Math.abs(today.getTime() - jobDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 30) {
            const key = jobDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (activityMap.has(key)) {
                activityMap.set(key, (activityMap.get(key) || 0) + 1)
            }
        }
    })

    const activityData = Array.from(activityMap).map(([date, count]) => ({ date, count }))

    // --- simple insights ---
    // (mock logic for now, real logic needs DB aggregation)
    let bottleneck = "None detected"
    const rejectionCount = jobs.filter(j => j.status?.toUpperCase() === 'REJECTED').length
    const ghostedCount = jobs.filter(j => j.status?.toUpperCase() === 'GHOSTED').length

    if (rejectionCount > ghostedCount && rejectionCount > interviews) bottleneck = "High Rejection Rate"
    if (ghostedCount > rejectionCount && ghostedCount > interviews) bottleneck = "Ghosting / No Response"
    if (interviews > rejectionCount) bottleneck = "Closing the Deal (Interviewing)"

    return (
        <AnalyticsClient
            data={{
                kpis: {
                    totalApplications,
                    interviewRate,
                    responseRate,
                    activePipeline: activePipelineCount
                },
                activity: activityData,
                insights: {
                    topStrength: "Full Stack Development", // Placeholder until we have keyword matching
                    bottleneck: bottleneck
                }
            }}
        />
    )
}
