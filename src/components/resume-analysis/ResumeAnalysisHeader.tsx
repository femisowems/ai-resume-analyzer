'use client'

import { ArrowLeft, Clock, Download, Share2 } from 'lucide-react'
import Link from 'next/link'
import JobTargetSelector from './JobTargetSelector'

interface Props {
    title: string
    score: number
    lastAnalyzed: string
}

export default function ResumeAnalysisHeader({ title, score, lastAnalyzed }: Props) {
    return (
        <div className="bg-slate-900 border-b border-slate-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Left: Title & Nav */}
                    <div className="space-y-1">
                        <Link
                            href="/dashboard/resumes"
                            className="inline-flex items-center text-xs text-slate-400 hover:text-white mb-1"
                        >
                            <ArrowLeft className="h-3 w-3 mr-1" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Updated {new Date(lastAnalyzed).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                                v2.0
                            </span>
                        </div>
                    </div>

                    {/* Center: Context Bar */}
                    <div className="flex-1 md:flex md:justify-center">
                        <JobTargetSelector />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-end mr-4">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AI Score</span>
                            <span className={`text-2xl font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {score}/100
                            </span>
                        </div>

                        <button className="hidden sm:flex items-center px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm transition-colors">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition-colors">
                            Optimize Now
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
