'use client'

import { JobExtended } from '@/lib/types'
import { FileText, MessageSquare, Plus } from 'lucide-react'

import { triggerInterviewPrep } from '@/app/dashboard/jobs/actions-analysis'

interface InterviewPrepViewProps {
    prep?: JobExtended['interview_prep_json']
    jobId?: string
}

export function InterviewPrepView({ prep, jobId }: InterviewPrepViewProps) {
    if (!prep) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="mx-auto h-12 w-12 text-gray-400">
                    <MessageSquare className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No Prep Material Yet</h3>
                <p className="mt-1 text-sm text-gray-500">Generate interview questions based on the job description.</p>
                <div className="mt-6">
                    {jobId && (
                        <form action={triggerInterviewPrep.bind(null, jobId)}>
                            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Generate Questions
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Interview Question Bank</h3>
                <ul className="mt-4 space-y-4">
                    {prep.questions.map((q, i) => (
                        <li key={i} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{q}</p>
                            <div className="mt-2 flex space-x-2">
                                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Draft Answer (STAR)</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
