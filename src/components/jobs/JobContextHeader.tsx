'use client'

import { JobExtended } from "@/lib/types"
import { Calendar, Building2, MapPin, ExternalLink, Clock } from "lucide-react"

interface JobContextHeaderProps {
    job: JobExtended
}

export function JobContextHeader({ job }: JobContextHeaderProps) {
    const stages = ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'HIRED']
    const currentStageIndex = stages.indexOf(job.status) !== -1 ? stages.indexOf(job.status) : 0

    // Calculate days open
    const daysOpen = Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 3600 * 24))

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            {/* Top Bar: Title & Metadata */}
            <div className=" px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                            {job.role}
                        </h1>
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                            <div className="flex items-center gap-1.5">
                                <Building2 className="h-4 w-4" />
                                <span className="font-medium">{job.company_name}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>Open for {daysOpen} days</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge (Desktop) */}
                    <div className="hidden sm:flex flex-col items-end">
                        <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                            ${job.status === 'APPLIED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                job.status === 'INTERVIEW' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    job.status === 'OFFER' ? 'bg-green-50 text-green-700 border-green-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'}
                        `}>
                            {job.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stage Progress Bar (Context Persister) */}
            <div className="px-4 sm:px-6 lg:px-8 pb-4">
                <div className="relative">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                        {stages.map((stage, idx) => {
                            const isCompleted = idx <= currentStageIndex
                            const isCurrent = idx === currentStageIndex
                            return (
                                <div
                                    key={stage}
                                    style={{ width: `${100 / stages.length}%` }}
                                    className={`
                                        shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500
                                        ${isCompleted ? (
                                            isCurrent ? 'bg-indigo-600' : 'bg-indigo-400'
                                        ) : 'bg-transparent'}
                                        ${idx !== stages.length - 1 ? 'border-r border-white/20' : ''}
                                    `}
                                />
                            )
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                        {stages.map((stage, idx) => (
                            <span key={stage} className={idx <= currentStageIndex ? 'text-indigo-600' : ''}>
                                {stage}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
