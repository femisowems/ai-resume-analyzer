import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ResumeAnalysisHeader from '@/components/resume-analysis/ResumeAnalysisHeader'
import ScoreBreakdown from '@/components/resume-analysis/ScoreBreakdown'
import ActionQueue from '@/components/resume-analysis/ActionQueue'
import KeywordCoverage from '@/components/resume-analysis/KeywordCoverage'
import StructuredResumeViewer from '@/components/resume-analysis/StructuredResumeViewer'
import { AnalysisResult, StructuredResumeContent } from '@/lib/types'
import { addSkillToResume } from './actions'
import { analyzeResumeAction } from '../actions'
import { Sparkles, Loader2 } from 'lucide-react'

import { safeParseAnalysis } from '@/lib/validations/analysis'

// Helper to provide safe defaults if data is missing or in old format
function normalizeAnalysis(analysis: any): AnalysisResult {
    return safeParseAnalysis(analysis)
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
        /**
         * Real-time Keyword Gap Analysis
         * Instead of relying on the stored (stale) job analysis which might be compared 
         * against an old resume, we re-calculate the gap here.
         */
        if (targetJob && targetJob.analysis_json) {
            const jobAnalysis = targetJob.analysis_json

            // 1. Reconstruct the "Ideal Keyword List" for this job
            const requiredKeywords = new Set([
                ...(jobAnalysis.keywords_matched || []),
                ...(jobAnalysis.missing_keywords || [])
            ].map(k => k.toLowerCase()))

            // 2. Get current resume keywords (normalized)
            const resumeKeywords = new Set(
                (analysis.keywords.present || []).map(k => k.toLowerCase())
            )

            // 3. Diff them live
            const liveMissing: string[] = []
            const liveMatched: string[] = []

            requiredKeywords.forEach(req => {
                // Check if resume has it (case-insensitive fuzzy match could go here, but Set is fast)
                if (resumeKeywords.has(req)) {
                    liveMatched.push(req) // We capitalize roughly based on input? No, lossy. 
                    // ideally we find the original casing from the job list.
                    // For now, let's just push the lowercase or try to find match.
                } else {
                    liveMissing.push(req)
                }
            })

            // Restore casing (optional polish) - for now just use the string we have. 
            // Actually, let's be nicer: find the original string from jobAnalysis.
            const originalMap = new Map<string, string>()
                ;[...(jobAnalysis.keywords_matched || []), ...(jobAnalysis.missing_keywords || [])].forEach(k => {
                    originalMap.set(k.toLowerCase(), k)
                })

            const finalMatched = liveMatched.map(k => originalMap.get(k) || k)
            const finalMissing = liveMissing.map(k => originalMap.get(k) || k)

            // 4. Override the display
            analysis = {
                ...analysis,
                keywords: {
                    ...analysis.keywords,
                    present: finalMatched,
                    missing: finalMissing,
                    irrelevant: [] // Hiding irrelevant for focused job view
                }
            }
        }
    }

    // Split layout
    return (
        <div className="bg-gray-50 pb-20">
            <ResumeAnalysisHeader
                title={resume.title}
                score={analysis.total}
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
                            overallScore={analysis.total}
                            subScores={analysis.breakdown}
                            isLoading={false} // Detail page is static server component, pending overlay handles the 'not analyzed' state
                        />

                        {/* 2. Action Queue */}
                        <div className="flex-1 min-h-0">
                            <ActionQueue suggestions={analysis.suggestions} />
                        </div>

                        {/* 3. Keyword Coverage */}
                        <KeywordCoverage
                            present={analysis.keywords.present}
                            missing={analysis.keywords.missing}
                            onAddKeyword={addSkillToResume.bind(null, resume.id)}
                        />

                    </div>
                </div>
            </div>

            {/* Analysis Pending Overlay / Modal if total is 0 */}
            {analysis.total === 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm w-full p-8 text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Pending</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            This resume hasn't been analyzed by AI yet. Get insights on keyword match, impact, and ATS score.
                        </p>
                        <form action={analyzeResumeAction.bind(null, resume.id)}>
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 group"
                            >
                                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                                Analyze Resume
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
