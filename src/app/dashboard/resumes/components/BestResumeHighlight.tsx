import { Crown, Sparkles, TrendingUp, Trophy } from 'lucide-react'
import Link from 'next/link'

interface BestResumeHighlightProps {
    resume: {
        id: string
        title: string
        updated_at: string
    }
    metrics: {
        score: number
        interviewRate: string
        totalApplications: number
    }
    aiReasoning: string
}

export default function BestResumeHighlight({ resume, metrics, aiReasoning }: BestResumeHighlightProps) {
    if (!resume) return null

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-xl mb-10">
            {/* Abstract Background Pattern */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-indigo-400 opacity-10 blur-3xl"></div>

            <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-medium text-white mb-2">
                        <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Top Performing Resume</span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                            {resume.title}
                        </h2>
                        <p className="text-indigo-100 text-sm max-w-xl leading-relaxed opacity-90">
                            <Sparkles className="w-4 h-4 inline-block mr-1 text-yellow-300" />
                            {aiReasoning}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                        <div>
                            <p className="text-xs text-indigo-200 uppercase tracking-wide font-medium">Interview Rate</p>
                            <p className="text-2xl font-bold text-white">{metrics.interviewRate}</p>
                        </div>
                        <div>
                            <p className="text-xs text-indigo-200 uppercase tracking-wide font-medium">ATS Score</p>
                            <p className="text-2xl font-bold text-white">{metrics.score}/100</p>
                        </div>
                        <div>
                            <p className="text-xs text-indigo-200 uppercase tracking-wide font-medium">Applications</p>
                            <p className="text-2xl font-bold text-white">{metrics.totalApplications}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <Link
                        href={`/dashboard/resumes/${resume.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-white text-indigo-700 px-6 py-3 font-semibold text-sm shadow-lg hover:bg-gray-50 transition-transform active:scale-95"
                    >
                        Use This Resume
                        <TrendingUp className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
