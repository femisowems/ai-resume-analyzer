'use client'

import { JobAsset } from '@/lib/types'
import { Download, RefreshCw, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface ResumeAnchorProps {
    resumeAsset: JobAsset | null
    status: 'ready' | 'needs_update'
    onChangeResume: () => void
    onOptimizeResume: () => void
}

export function ResumeAnchor({ resumeAsset, status, onChangeResume, onOptimizeResume }: ResumeAnchorProps) {
    if (!resumeAsset) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No Resume Linked</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Link a resume to this job to generate tailored application documents.
                        </p>
                        <button
                            onClick={onChangeResume}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            Select Resume
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const resumeTitle = resumeAsset.resume_version?.resume?.title || 'Unknown Resume'
    const versionNumber = resumeAsset.resume_version?.version_number || 1

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Resume Used
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'ready'
                            ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800'
                            }`}>
                            {status === 'ready' ? '✅ Ready' : '⚠ Needs Update'}
                        </span>
                    </div>

                    <div className="mt-3">
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {resumeTitle}
                            </h2>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-1 rounded">
                                v{versionNumber}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            All documents below are generated from this resume version
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                    <button
                        onClick={onChangeResume}
                        className="inline-flex items-center px-4 py-2 border border-indigo-300 dark:border-indigo-700 text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Change Resume
                    </button>
                    <button
                        onClick={onOptimizeResume}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        Optimize for Job
                    </button>
                </div>
            </div>
        </div>
    )
}
