'use client'

import { useState } from 'react'
import { Briefcase, ChevronDown } from 'lucide-react'

// Mock Data for now - will be replaced by API fetch
const MOCK_JOBS = [
    { id: '1', title: 'Senior Frontend Engineer', company: 'Google' },
    { id: '2', title: 'Fullstack Developer', company: 'StartUp Inc' },
    { id: '3', title: 'Product Engineer', company: 'Vercel' },
]

export default function JobTargetSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<typeof MOCK_JOBS[0] | null>(null)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm transition-all border border-gray-200 shadow-sm hover:border-indigo-300"
            >
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <span className="font-medium">
                    {selectedJob ? `${selectedJob.title} @ ${selectedJob.company}` : 'General Analysis (No Target)'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target A Job</p>
                    </div>

                    <button
                        onClick={() => { setSelectedJob(null); setIsOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                        Generic Software Role
                    </button>

                    {MOCK_JOBS.map((job) => (
                        <button
                            key={job.id}
                            onClick={() => { setSelectedJob(job); setIsOpen(false) }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex flex-col"
                        >
                            <span className="font-medium">{job.title}</span>
                            <span className="text-xs text-gray-500">{job.company}</span>
                        </button>
                    ))}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                        <button className="w-full text-left px-4 py-2 text-xs text-indigo-600 font-medium hover:bg-indigo-50">
                            + Add New Job
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
