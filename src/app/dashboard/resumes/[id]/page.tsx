import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ResumeAnalysisHeader from '@/components/resume-analysis/ResumeAnalysisHeader'
import ScoreBreakdown from '@/components/resume-analysis/ScoreBreakdown'
import ActionQueue from '@/components/resume-analysis/ActionQueue'
import KeywordCoverage from '@/components/resume-analysis/KeywordCoverage'
import StructuredResumeViewer from '@/components/resume-analysis/StructuredResumeViewer'
import { AnalysisResult, StructuredResumeContent } from '@/lib/types'

// Helper to provide safe defaults if data is missing or in old format
function normalizeAnalysis(analysis: any): AnalysisResult {
    const defaults: AnalysisResult = {
        overall_score: analysis?.score || 0,
        sub_scores: analysis?.sub_scores || {
            ats_compatibility: 0,
            impact_metrics: 0,
            clarity: 0,
            keyword_match: 0,
            seniority_fit: 0
        },
        keywords: analysis?.keywords || { present: [], missing: [], irrelevant: [] },
        suggestions: analysis?.suggestions || (analysis?.improvements || []).map((imp: string, i: number) => ({
            id: `legacy-${i}`,
            type: 'general',
            severity: 'medium',
            section_target: 'general',
            description: imp,
            proposed_fix: ''
        }))
    }
    return defaults
}

function normalizeContent(content: any): StructuredResumeContent {
    // If it's already "structured" with sections
    if (content.summary && typeof content.summary === 'object') {
        return content as StructuredResumeContent
    }

    // Legacy fallback
    return {
        summary: { content: content.summary || '' },
        contact_info: { content: content.contact_info || '' },
        skills: { content: Array.isArray(content.skills) ? content.skills.join(', ') : (content.skills || '') },
        experience: Array.isArray(content.experience) ? content.experience.map((e: any, i: number) => ({
            id: `legacy-exp-${i}`,
            role: e.role || '',
            company: e.company || '',
            duration: e.duration || '',
            bullets: [e.description || '']
        })) : [],
        education: Array.isArray(content.education) ? content.education.map((e: any, i: number) => ({
            id: `legacy-edu-${i}`,
            degree: e.degree || '',
            school: e.school || '',
            year: e.year || ''
        })) : [],
        projects: []
    }
}

export default async function ResumeDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ jobId?: string }> }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const resolvedParams = await params
    const resolvedSearchParams = await searchParams
    const { id } = resolvedParams
    const { jobId } = resolvedSearchParams

    // Fetch Resume + Current Version
    const { data: resume } = await supabase
        .from('resumes')
        .select(`
            *,
            current_version:resume_versions(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!resume) {
        notFound()
    }

    // Fetch active jobs for the selector
    const { data: jobs } = await supabase
        .from('job_applications')
        .select('id, role, company_name, analysis_json')
        .eq('user_id', user.id)
        .in('status', ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER'])
        .order('created_at', { ascending: false })

    // Handle array response
    const currentVersionRaw = Array.isArray(resume.current_version) ? resume.current_version[0] : resume.current_version

    // Parse / Normalize Data
    // Note: In real app, we might check if 'analysis_result' is old format and re-trigger AI if needed.
    let analysis = normalizeAnalysis(currentVersionRaw?.analysis_result || {})
    const content = normalizeContent(currentVersionRaw?.content || {})

    // IF A JOB IS SELECTED, WE OVERRIDE THE ANALYSIS CONTEXT
    let targetJob = null
    if (jobId && jobs) {
        targetJob = jobs.find(j => j.id === jobId)
        if (targetJob && targetJob.analysis_json) {
            // Merge Job Analysis into Resume Analysis
            // 1. Override missing keywords
            const jobAnalysis = targetJob.analysis_json

            // We want to show what is missing from the JOB, not just the general resume check
            const missingFromJob = jobAnalysis.missing_keywords || []
            const matchedFromJob = jobAnalysis.keywords_matched || []

            analysis = {
                ...analysis,
                keywords: {
                    ...analysis.keywords,
                    present: matchedFromJob, // approximate mapping
                    missing: missingFromJob
                }
            }
        }
    }

    // Split layout
    return (
        <div className="bg-gray-50 pb-20">
            <ResumeAnalysisHeader
                title={resume.title}
                score={analysis.overall_score}
                lastAnalyzed={currentVersionRaw?.created_at || resume.updated_at}
                jobs={jobs as any || []}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                    {/* Left Column: Interactive Viewer (60%) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Interactive Resume</h2>
                                {targetJob && (
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium border border-indigo-200">
                                        Targeting: {targetJob.role}
                                    </span>
                                )}
                            </div>

                            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100">
                                ✎ Click any section to edit
                            </span>
                        </div>
                        <StructuredResumeViewer content={content} resumeId={resume.id} />
                    </div>

                    {/* Right Column: AI Coach (40%) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar pb-10">

                        {/* 1. Score Breakdown */}
                        <ScoreBreakdown
                            overallScore={analysis.overall_score}
                            subScores={analysis.sub_scores}
                        />

                        {/* 2. Action Queue */}
                        <div className="flex-1 min-h-0">
                            <ActionQueue suggestions={analysis.suggestions} />
                        </div>

                        {/* 3. Keyword Coverage */}
                        <KeywordCoverage
                            present={analysis.keywords.present}
                            missing={analysis.keywords.missing}
                        />

                    </div>
                </div>
            </div>
        </div>
    )
}
