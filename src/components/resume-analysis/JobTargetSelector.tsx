import { useState, useEffect } from 'react'
import { Briefcase, ChevronDown, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Job } from '@/lib/types'

interface JobTargetSelectorProps {
    jobs: Job[]
}

export default function JobTargetSelector({ jobs }: JobTargetSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)

    // Derived state from URL
    const currentJobId = searchParams.get('jobId')
    const selectedJob = jobs.find(j => j.id === currentJobId)

    const handleSelect = (jobId: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (jobId) {
            params.set('jobId', jobId)
        } else {
            params.delete('jobId')
        }
        router.push(`?${params.toString()}`)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all border shadow-sm
                    ${selectedJob
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
            >
                <Briefcase className={`h-4 w-4 ${selectedJob ? 'text-indigo-600' : 'text-gray-500'}`} />
                <span className="font-medium max-w-[200px] truncate">
                    {selectedJob ? `${selectedJob.role} @ ${selectedJob.company_name}` : 'General Analysis (No Target)'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 max-h-96 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target A Job Application</p>
                    </div>

                    <button
                        onClick={() => handleSelect(null)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between group"
                    >
                        <span className={!selectedJob ? 'font-semibold text-indigo-600' : ''}>Generic / General Base</span>
                        {!selectedJob && <Check className="h-4 w-4 text-indigo-600" />}
                    </button>

                    {jobs.map((job) => (
                        <button
                            key={job.id}
                            onClick={() => handleSelect(job.id)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-t border-gray-50"
                        >
                            <div className="flex flex-col overflow-hidden mr-3">
                                <span className={`font-medium truncate ${selectedJob?.id === job.id ? 'text-indigo-700' : 'text-gray-900'}`}>
                                    {job.role}
                                </span>
                                <span className="text-xs text-gray-500 truncate">{job.company_name}</span>
                            </div>
                            {selectedJob?.id === job.id && <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    )
}
