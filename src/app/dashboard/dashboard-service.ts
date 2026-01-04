import { createClient } from '@/lib/supabase/server'

export type CareerHealthStats = {
    score: number
    trend: 'up' | 'down' | 'stable'
    applicationsActive: number
    interviewRate: number
    responseRate: number
}

export type PriorityAction = {
    id: string
    title: string
    description: string
    type: 'critical' | 'warning' | 'info'
    actionLabel: string
    actionUrl: string
    jobId?: string
}

export type PipelineStage = {
    name: string
    count: number
    color: string
}

export type DashboardData = {
    health: CareerHealthStats
    actions: PriorityAction[]
    pipeline: PipelineStage[]
    recentDocs: any[]
}

export async function getDashboardData(): Promise<DashboardData> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Parallelize detailed data fetching
    const [
        jobsResult,
        resumesResult,
        documentsResult,
        applicationsResult
    ] = await Promise.all([
        supabase.from('job_applications').select('*').eq('user_id', user.id),
        supabase.from('resumes').select('*').eq('user_id', user.id),
        supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('job_applications').select('status, created_at').eq('user_id', user.id)
    ])

    const jobs = jobsResult.data || []
    const resumes = resumesResult.data || [] // Currently unused but good for context if needed later
    const recentDocs = documentsResult.data || []

    // --- 1. Career Health Calculation ---
    // Simple heuristic for now
    const activeApps = jobs.filter(j => ['applied', 'screening', 'interview'].includes(j.status?.toLowerCase())).length
    const interviews = jobs.filter(j => j.status?.toLowerCase() === 'interview').length
    const offers = jobs.filter(j => j.status?.toLowerCase() === 'offer').length

    // Score Formula: Base 50 + (Active * 2) + (Interviews * 10) + (Offers * 20) -> Cap at 100
    let healthScore = 50 + (activeApps * 2) + (interviews * 10) + (offers * 20)
    if (healthScore > 100) healthScore = 100

    const health: CareerHealthStats = {
        score: healthScore,
        trend: 'up', // Placeholder logic
        applicationsActive: activeApps,
        interviewRate: activeApps > 0 ? Math.round((interviews / activeApps) * 100) : 0,
        responseRate: 0 // Need more data points to calc properly
    }

    // --- 2. Priority Actions Engine ---
    const actions: PriorityAction[] = []

    // Critical: Upcoming Interviews (Mock logic: if status is interview)
    jobs.filter(j => j.status?.toLowerCase() === 'interview').forEach(job => {
        actions.push({
            id: `interview-${job.id}`,
            title: 'Upcoming Interview',
            description: `Prepare for your interview at ${job.company_name}`,
            type: 'critical',
            actionLabel: 'Prep Now',
            actionUrl: `/dashboard/jobs/${job.id}`,
            jobId: job.id
        })
    })

    // Warning: Stale Applications (> 7 days in 'applied')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    jobs.filter(j =>
        j.status?.toLowerCase() === 'applied' &&
        new Date(j.created_at) < sevenDaysAgo
    ).forEach(job => {
        actions.push({
            id: `stale-${job.id}`,
            title: 'Follow Up Needed',
            description: `No update from ${job.company_name} in 7+ days`,
            type: 'warning',
            actionLabel: 'Draft Email',
            actionUrl: `/dashboard/jobs/${job.id}?action=followup`,
            jobId: job.id
        })
    })

    // Info: No Resume (if user has 0 resumes)
    if (resumes.length === 0) {
        actions.push({
            id: 'no-resume',
            title: 'Upload Resume',
            description: 'Start by uploading your first resume',
            type: 'info',
            actionLabel: 'Upload',
            actionUrl: '/dashboard/resumes/new'
        })
    }

    // Sort actions: Critical > Warning > Info
    const urgencyMap = { critical: 3, warning: 2, info: 1 }
    actions.sort((a, b) => urgencyMap[b.type] - urgencyMap[a.type])


    // --- 3. Pipeline Visualization ---
    // Normalize statuses
    const statusCounts: Record<string, number> = {
        'Applied': 0,
        'Screening': 0,
        'Interview': 0,
        'Offer': 0
    }

    jobs.forEach(job => {
        const s = job.status?.toLowerCase() || 'applied'
        if (s.includes('appl')) statusCounts['Applied']++
        else if (s.includes('screen')) statusCounts['Screening']++
        else if (s.includes('inter')) statusCounts['Interview']++
        else if (s.includes('offer')) statusCounts['Offer']++
        else statusCounts['Applied']++ // Default bucket
    })

    const pipeline: PipelineStage[] = [
        { name: 'Applied', count: statusCounts['Applied'], color: 'bg-blue-500' },
        { name: 'Screening', count: statusCounts['Screening'], color: 'bg-indigo-500' },
        { name: 'Interview', count: statusCounts['Interview'], color: 'bg-purple-500' },
        { name: 'Offer', count: statusCounts['Offer'], color: 'bg-green-500' },
    ]

    return {
        health,
        actions,
        pipeline,
        recentDocs: recentDocs.map((d: any) => ({
            id: d.id,
            title: d.title || 'Untitled Document',
            type: d.type,
            date: d.created_at
        }))
    }
}
