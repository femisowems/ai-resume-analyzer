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

export default async function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const resolvedParams = await params
    const { id } = resolvedParams

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

    // Handle array response from easier join syntax (though .single() usually implies object but joined rels might be array)
    const currentVersionRaw = Array.isArray(resume.current_version) ? resume.current_version[0] : resume.current_version

    // Parse / Normalize Data
    // Note: In real app, we might check if 'analysis_result' is old format and re-trigger AI if needed.
    const analysis = normalizeAnalysis(currentVersionRaw?.analysis_result || {})
    const content = normalizeContent(currentVersionRaw?.content || {})

    // Split layout
    return (
        <div className="bg-gray-50 pb-20">
            <ResumeAnalysisHeader
                title={resume.title}
                score={analysis.overall_score}
                lastAnalyzed={currentVersionRaw?.created_at || resume.updated_at}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                    {/* Left Column: Interactive Viewer (60%) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Interactive Resume</h2>
                            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100">
                                ✎ Click any section to edit
                            </span>
                        </div>
                        <StructuredResumeViewer content={content} />
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
