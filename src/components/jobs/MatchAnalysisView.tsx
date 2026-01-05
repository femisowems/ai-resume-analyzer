'use client'

import { JobExtended } from '@/lib/types'
import { CheckCircle2, AlertOctagon, TrendingUp, RefreshCw, Zap } from 'lucide-react'
import { triggerJobAnalysis } from '@/app/dashboard/jobs/actions-analysis'

interface MatchAnalysisViewProps {
    analysis?: JobExtended['match_analysis_json']
    jobId?: string
}

export function MatchAnalysisView({ analysis, jobId }: MatchAnalysisViewProps) {
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

    const { score, missing_keywords, present_keywords, analysis_text } = analysis

    // Circular Gauge logic
    const radius = 50
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (score / 100) * circumference
    const color = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626' // Green, Amber, Red

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Gauge */}
                <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="relative h-32 w-32">
                        {/* Background Circle */}
                        <svg className="h-full w-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="50"
                                stroke="#f3f4f6"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="50"
                                stroke={color}
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900">{score}%</span>
                            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Match</span>
                        </div>
                    </div>
                </div>

                {/* Analysis Summary */}
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis</h3>
                            <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                {analysis_text}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Keywords Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing - The "Gap" */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
                        <h3 className="font-semibold text-red-900 flex items-center">
                            <AlertOctagon className="h-5 w-5 mr-2 text-red-500" />
                            Missing Keywords ({missing_keywords.length})
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-gray-500 mb-4">
                            These skills appear in the job description but are missing from your resume. Add them to boost your score.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {missing_keywords.length > 0 ? missing_keywords.map((k) => (
                                <span key={k} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-red-200 text-red-700 shadow-sm">
                                    {k}
                                </span>
                            )) : (
                                <p className="text-sm text-gray-400 italic">No missing keywords found!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Present - The "Match" */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 bg-green-50/50 border-b border-green-100 flex items-center justify-between">
                        <h3 className="font-semibold text-green-900 flex items-center">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                            Matched Skills ({present_keywords.length})
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-gray-500 mb-4">
                            You have successfully demonstrated these key requirements.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {present_keywords.length > 0 ? present_keywords.map((k) => (
                                <span key={k} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                    {k}
                                </span>
                            )) : (
                                <p className="text-sm text-gray-400 italic">No matches found yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
