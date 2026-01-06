'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, User, Briefcase, MapPin, ExternalLink, Clock } from 'lucide-react'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { JobActionDrawer } from './JobActionDrawer'
import { JobExtended, JobStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface JobHeaderProps {
    job: JobExtended
    nextJobId?: string
    prevJobId?: string
}

export function JobHeader({ job, nextJobId, prevJobId }: JobHeaderProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case 'OFFER': return 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20'
            case 'REJECTED': return 'bg-destructive/10 text-destructive ring-destructive/20'
            case 'INTERVIEW': return 'bg-purple-500/10 text-purple-700 ring-purple-500/20'
            case 'APPLIED': return 'bg-blue-500/10 text-blue-700 ring-blue-500/20'
            case 'ARCHIVED': return 'bg-secondary text-secondary-foreground ring-secondary-foreground/20'
            default: return 'bg-secondary text-secondary-foreground ring-secondary-foreground/20'
        }
    }

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }

    // Determine Primary CTA based on status/stage
    const getPrimaryCTA = () => {
        if (job.status === 'SAVED') return { label: 'Apply Now', href: '#' }
        if (job.status === 'APPLIED') return { label: 'Track Application', action: () => setIsDrawerOpen(true) }
        if (job.status === 'INTERVIEW') return { label: 'Prep for Interview', href: `/dashboard/jobs/${job.id}/interview` }
        if (job.status === 'OFFER') return { label: 'Evaluate Offer', action: () => setIsDrawerOpen(true) }
        return null
    }

    const cta = getPrimaryCTA()

    return (
        <>
            <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-20 shadow-sm md:static md:shadow-none md:border-none md:bg-transparent transition-colors">
                <div className="p-4 md:p-0 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/dashboard/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Jobs
                        </Link>

                        <div className="flex items-center gap-2">
                            {/* ... navigation arrows ... */}
                            <Link
                                href={prevJobId ? `/dashboard/jobs/${prevJobId}` : '#'}
                                aria-disabled={!prevJobId}
                                className={cn(
                                    "p-1.5 rounded-md border border-border transition-colors",
                                    prevJobId
                                        ? 'text-muted-foreground hover:text-primary hover:bg-muted'
                                        : 'text-muted-foreground/30 cursor-not-allowed bg-muted/30'
                                )}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                            <Link
                                href={nextJobId ? `/dashboard/jobs/${nextJobId}` : '#'}
                                aria-disabled={!nextJobId}
                                className={cn(
                                    "p-1.5 rounded-md border border-border transition-colors",
                                    nextJobId
                                        ? 'text-muted-foreground hover:text-primary hover:bg-muted'
                                        : 'text-muted-foreground/30 cursor-not-allowed bg-muted/30'
                                )}
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
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight">
                                    {job.job_title}
                                </h1>

                                <div className="flex flex-wrap items-center mt-2 text-muted-foreground text-sm gap-y-2">
                                    <span className="font-semibold text-foreground flex items-center mr-4">
                                        <Briefcase className="w-4 h-4 mr-1.5 text-muted-foreground" />
                                        {job.company_name}
                                    </span>

                                    <span className="flex items-center mr-4">
                                        <Calendar className="w-4 h-4 mr-1.5 text-muted-foreground" />
                                        Applied: {new Date(job.applied_date || job.created_at).toLocaleDateString()}
                                    </span>

                                    {job.match_score && (
                                        <span className="flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-xs border border-primary/20">
                                            {job.match_score}% Match
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${getStatusColor(job.status)}`}>
                                {formatStatus(job.status)}
                            </span>

                            {cta && (
                                cta.href && cta.href !== '#' ? (
                                    <Link
                                        href={cta.href}
                                        className="hidden md:inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors whitespace-nowrap"
                                    >
                                        {cta.label}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={cta.action || (() => setIsDrawerOpen(true))}
                                        className="hidden md:inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors whitespace-nowrap"
                                    >
                                        {cta.label}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <JobActionDrawer
                job={job}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </>
    )
}

