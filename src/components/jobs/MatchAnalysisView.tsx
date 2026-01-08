'use client'

import { JobExtended } from '@/lib/types'
import { CheckCircle2, AlertOctagon, TrendingUp, RefreshCw, Zap, Sparkles } from 'lucide-react'
import { triggerJobAnalysis } from '@/app/dashboard/jobs/actions-analysis'
import Link from 'next/link'

interface MatchAnalysisViewProps {
    analysis?: JobExtended['match_analysis_json']
    jobId?: string
    resumeId?: string
}

export function MatchAnalysisView({ analysis, jobId, resumeId }: MatchAnalysisViewProps) {
    if (!analysis) {
        return (
            <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100">
                <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Zap className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">Unlock Job Intelligence</h3>
                <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                    See exactly how well your resume matches this job description and get AI-powered suggestions to improve your score.
                </p>
                <div className="mt-6">
                    {jobId && (
                        <form action={triggerJobAnalysis.bind(null, jobId)}>
                            <button type="submit" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Run Match Analysis
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )
    }

    const {
        score,
        missing_keywords,
        present_keywords,
        analysis_text,
        // New fields with fallbacks
        executive_summary,
        strengths = [],
        gaps = [],
        verdict = "Potential Match"
    } = analysis

    // Helper for color coding
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-500' : 'text-red-500'
    const scoreBg = score >= 80 ? 'bg-green-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50'
    const scoreBorder = score >= 80 ? 'border-green-100' : score >= 50 ? 'border-amber-100' : 'border-red-100'

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Sticky Anchor (35%) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 1. HERO MATCH SCORE CARD */}
                    <div className={`rounded-2xl p-6 border ${scoreBorder} ${scoreBg} shadow-sm text-center relative overflow-hidden`}>
                        <div className="relative z-10">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Match Score</h3>
                            <div className={`text-6xl font-black ${scoreColor} tracking-tight mb-2`}>
                                {score}%
                            </div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/80 border ${scoreBorder} ${scoreColor}`}>
                                {verdict}
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white opacity-20 blur-2xl"></div>
                    </div>

                    {/* 2. ACTION DOCK */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommended Actions</h4>


                        {jobId ? (
                            <>
                                {resumeId ? (
                                    <Link
                                        href={`/dashboard/resumes/${resumeId}/optimize?jobId=${jobId}`}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm group"
                                    >
                                        <span>Optimize Resume</span>
                                        <Sparkles className="h-4 w-4 text-indigo-200 group-hover:text-white transition-colors" />
                                    </Link>
                                ) : (
                                    <button disabled className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed" title="No resume linked">
                                        <span>Optimize Resume</span>
                                        <Sparkles className="h-4 w-4 text-gray-300" />
                                    </button>
                                )}

                                <Link
                                    href={`/dashboard/jobs/${jobId}/cover-letter`}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <span>Draft Cover Letter</span>
                                    <TrendingUp className="h-4 w-4 text-gray-400" />
                                </Link>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <button disabled className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                    <span>Optimize Resume</span>
                                    <Sparkles className="h-4 w-4 text-gray-300" />
                                </button>
                                <button disabled className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg text-sm font-medium cursor-not-allowed">
                                    <span>Draft Cover Letter</span>
                                    <TrendingUp className="h-4 w-4 text-gray-300" />
                                </button>
                            </div>
                        )}

                        {jobId && (
                            <form action={triggerJobAnalysis.bind(null, jobId)}>
                                <button type="submit" className="w-full flex items-center justify-between px-4 py-2 mt-4 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors group">
                                    <span>Refresh Analysis</span>
                                    <RefreshCw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                            </form>
                        )}
                    </div>

                    {/* 3. QUICK MISSING KEYWORDS SNAPSHOT */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                            <AlertOctagon className="h-3 w-3 mr-1.5 text-red-500" />
                            Critical Gaps ({missing_keywords.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {missing_keywords.slice(0, 5).map((k: string) => (
                                <span key={k} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                    {k}
                                </span>
                            ))}
                            {missing_keywords.length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 text-xs text-gray-400">
                                    +{missing_keywords.length - 5} more
                                </span>
                            )}
                            {missing_keywords.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No gaps found. Great job!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Deep Dive (65%) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. EXECUTIVE SUMMARY */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Zap className="h-5 w-5 text-indigo-500 mr-2" />
                            Executive Application Summary
                        </h3>
                        {executive_summary ? (
                            <p className="text-gray-700 leading-relaxed text-lg border-l-4 border-indigo-500 pl-4 py-1 italic bg-gray-50/50 rounded-r-lg">
                                &quot;{executive_summary}&quot;
                            </p>
                        ) : (
                            <p className="text-gray-600 leading-relaxed">
                                {analysis_text || "No analysis generated yet."}
                            </p>
                        )}
                    </div>

                    {/* 2. STRUCTURED STRENGTHS & GAPS */}
                    {(strengths.length > 0 || gaps.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 bg-green-50/30 border-b border-green-100 flex items-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                    <h4 className="font-semibold text-green-900 text-sm">Top Strengths</h4>
                                </div>
                                <ul className="p-5 space-y-3">
                                    {strengths.map((s: string, i: number) => (
                                        <li key={i} className="flex items-start text-sm text-gray-700">
                                            <span className="mr-2 text-green-500 mt-0.5">•</span>
                                            {s}
                                        </li>
                                    ))}
                                    {strengths.length === 0 && <li className="text-sm text-gray-400 italic">Analysis pending...</li>}
                                </ul>
                            </div>

                            {/* Gaps */}
                            <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 bg-red-50/30 border-b border-red-100 flex items-center">
                                    <AlertOctagon className="h-4 w-4 text-red-600 mr-2" />
                                    <h4 className="font-semibold text-red-900 text-sm">Risk Areas</h4>
                                </div>
                                <ul className="p-5 space-y-3">
                                    {gaps.map((g: string, i: number) => (
                                        <li key={i} className="flex items-start text-sm text-gray-700">
                                            <span className="mr-2 text-red-500 mt-0.5">•</span>
                                            {g}
                                        </li>
                                    ))}
                                    {gaps.length === 0 && <li className="text-sm text-gray-400 italic">No major risks identified.</li>}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Fallback for old textual analysis if structured data is missing but text exists */}
                    {!executive_summary && analysis_text && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detailed Report</h4>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{analysis_text}</p>
                        </div>
                    )}

                    {/* 3. FULL KEYWORD BREAKDOWN (Collapsed/Secondary) */}
                    <div className="pt-8 border-t border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-6">Keyword Detection</h3>
                        <div className="flex flex-wrap gap-2">
                            {present_keywords.map((k: string) => (
                                <span key={k} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                    {k}
                                </span>
                            ))}
                            {missing_keywords.map((k: string) => (
                                <span key={k} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 opacity-60 grayscale">
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
