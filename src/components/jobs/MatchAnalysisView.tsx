'use client'

import { JobExtended } from '@/lib/types'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { triggerJobAnalysis } from '@/app/dashboard/jobs/actions-analysis'

interface MatchAnalysisViewProps {
    analysis?: JobExtended['match_analysis_json']
    jobId?: string // Optional for the view only case, required for button
}

export function MatchAnalysisView({ analysis, jobId }: MatchAnalysisViewProps) {
    if (!analysis) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="mx-auto h-12 w-12 text-gray-400">
                    <AlertTriangle className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No Analysis Available</h3>
                <p className="mt-1 text-sm text-gray-500">Run an analysis to see how your resume matches this job description.</p>
                <div className="mt-6">
                    {jobId && (
                        <form action={triggerJobAnalysis.bind(null, jobId)}>
                            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )
    }

    const { score, missing_keywords, present_keywords, analysis_text } = analysis

    return (
        <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Match Score</h3>
                        <p className="mt-1 text-sm text-gray-500">Based on keyword overlap and semantic similarity.</p>
                    </div>
                    <div className="flex items-center">
                        <div className={`text-4xl font-extrabold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {score}%
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${score >= 80 ? 'bg-green-600' : score >= 50 ? 'bg-yellow-500' : 'bg-red-600'}`} style={{ width: `${score}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Keywords */}
                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {missing_keywords.map((keyword) => (
                            <span key={keyword} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {keyword}
                            </span>
                        ))}
                        {missing_keywords.length === 0 && <span className="text-gray-500 text-sm">None! You matched everything.</span>}
                    </div>
                </div>

                {/* Present Keywords */}
                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        Matched Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {present_keywords.map((keyword) => (
                            <span key={keyword} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {keyword}
                            </span>
                        ))}
                        {present_keywords.length === 0 && <span className="text-gray-500 text-sm">No matches found.</span>}
                    </div>
                </div>
            </div>

            {/* Analysis Text */}
            <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Feedback</h3>
                <div className="prose prose-sm text-gray-500">
                    <p>{analysis_text}</p>
                </div>
            </div>
        </div>
    )
}
