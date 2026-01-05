'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, User, Briefcase, MapPin, ExternalLink, Clock } from 'lucide-react'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { JobExtended, JobStatus } from '@/lib/types'

interface JobHeaderProps {
    job: JobExtended
    nextJobId?: string
    prevJobId?: string
}

export function JobHeader({ job, nextJobId, prevJobId }: JobHeaderProps) {
    // Local state for optimistic updates if we were to implement them, 
    // but for now this just renders server data mostly.

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case 'OFFER': return 'bg-green-100 text-green-800 ring-green-600/20'
            case 'REJECTED': return 'bg-red-100 text-red-800 ring-red-600/20'
            case 'INTERVIEW': return 'bg-purple-100 text-purple-800 ring-purple-600/20'
            case 'APPLIED': return 'bg-blue-100 text-blue-800 ring-blue-600/20'
            case 'ARCHIVED': return 'bg-gray-100 text-gray-800 ring-gray-600/20'
            default: return 'bg-gray-100 text-gray-800 ring-gray-600/20'
        }
    }

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }

    // Determine Primary CTA based on status/stage
    // This is simple logic for now, can be expanded with the "Next Action" engine later
    const getPrimaryCTA = () => {
        if (job.status === 'SAVED') return { label: 'Apply Now', href: '#' }
        if (job.status === 'APPLIED') return { label: 'Track Application', href: '#' } // Maybe prepare interview?
        if (job.status === 'INTERVIEW') return { label: 'Prep for Interview', href: `/dashboard/jobs/${job.id}/interview` }
        if (job.status === 'OFFER') return { label: 'Evaluate Offer', href: '#' }
        return null
    }

    const cta = getPrimaryCTA()

    return (
        <div className="bg-white border-b sticky top-0 z-20 shadow-sm md:static md:shadow-none md:border-none md:bg-transparent">
            <div className="p-4 md:p-0 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/dashboard/jobs" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Jobs
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href={prevJobId ? `/dashboard/jobs/${prevJobId}` : '#'}
                            aria-disabled={!prevJobId}
                            className={`p-1.5 rounded-md border border-gray-200 transition-colors ${prevJobId
                                ? 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                : 'text-gray-300 cursor-not-allowed bg-gray-50'
                                }`}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <Link
                            href={nextJobId ? `/dashboard/jobs/${nextJobId}` : '#'}
                            aria-disabled={!nextJobId}
                            className={`p-1.5 rounded-md border border-gray-200 transition-colors ${nextJobId
                                ? 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                : 'text-gray-300 cursor-not-allowed bg-gray-50'
                                }`}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex text-start gap-4 w-full">
                        <CompanyLogo
                            jobId={job.id}
                            companyName={job.company_name}
                            logoUrl={job.company_logo_cache}
                            size={64}
                            className="rounded-xl shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                                {job.job_title}
                            </h1>

                            <div className="flex flex-wrap items-center mt-2 text-gray-500 text-sm gap-y-2">
                                <span className="font-semibold text-gray-700 flex items-center mr-4">
                                    <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" />
                                    {job.company_name}
                                </span>

                                <span className="flex items-center mr-4">
                                    <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                                    Applied: {new Date(job.applied_date || job.created_at).toLocaleDateString()}
                                </span>

                                {/* Match Score Badge - Placeholder for now until we compute it properly */}
                                {job.match_score && (
                                    <span className="flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium text-xs border border-indigo-100">
                                        {job.match_score}% Match
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${getStatusColor(job.status)}`}>
                            {formatStatus(job.status)}
                        </span>

                        {cta && (
                            <Link
                                href={cta.href}
                                className="hidden md:inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                {cta.label}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
