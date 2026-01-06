'use client'

import { Job, JobStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, ExternalLink, Mail, FileText, MessageSquare, Briefcase } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
// Dynamic import for server actions to avoid bundling issues in some setups, but here we can try direct if strictly client
// import { triggerJobAnalysis } from '@/app/dashboard/jobs/actions-analysis' 

interface JobActionDrawerProps {
    job: Job | null
    isOpen: boolean
    onClose: () => void
}

export function JobActionDrawer({ job, isOpen, onClose }: JobActionDrawerProps) {
    const [animateIn, setAnimateIn] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setAnimateIn(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setAnimateIn(false), 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }

        // Cleanup function for unmount (navigating away)
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleActionClick = async (action: string) => {
        if (action === 'Analyze Match' && job) {
            try {
                // Dynamically import to ensure we are calling server action from client correctly
                const { triggerJobAnalysis } = await import('@/app/dashboard/jobs/actions-analysis')
                await triggerJobAnalysis(job.id)
                // In a real app, we would dispatch a toast here
            } catch (error) {
                console.error("Analysis failed", error)
            }
        }
    }

    if (!job) return null

    // Determine context-aware actions based on status
    const getActions = (status: JobStatus) => {
        switch (status) {
            case 'SAVED': return ['Analyze Match', 'Prepare Resume', 'Write Cover Letter']
            case 'APPLIED': return ['Log Follow-up', 'Prepare for Screen']
            case 'INTERVIEW': return ['Interview Prep', 'Mock Interview', 'Log Feedback']
            case 'OFFER': return ['Analyze Offer', 'Negotiation Scripts']
            default: return ['Add Note']
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-2 bottom-2 right-2 w-[480px] bg-background rounded-2xl shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border border-border",
                    isOpen ? "translate-x-0" : "translate-x-[120%]"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-start justify-between bg-muted/30 rounded-t-2xl">
                    <div className="flex gap-4">
                        <CompanyLogo
                            jobId={job.id}
                            companyName={job.company_name}
                            logoUrl={job.company_logo || job.company_logo_cache}
                            size={64}
                            className="rounded-xl shadow-sm bg-muted/50"
                        />
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-xl font-bold text-foreground leading-none">{job.role}</h2>
                            <p className="text-muted-foreground font-medium leading-tight">{job.company_name}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Link
                                    href={`/dashboard/jobs/${job.id}`}
                                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-primary text-primary-foreground rounded-md border border-primary hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    Open War Room
                                    <ExternalLink size={12} className="ml-1" />
                                </Link>
                                <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md border border-primary/20">
                                    {job.status.replace('_', ' ')}
                                </span>
                                {job.match_score && (
                                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-md border border-emerald-500/20">
                                        {job.match_score}% Match
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Primary Actions (Context Aware) */}
                    <div className="grid grid-cols-2 gap-3">
                        {getActions(job.status).map((action, i) => (
                            <button
                                key={i}
                                onClick={() => handleActionClick(action)}
                                className="flex items-center gap-2 justify-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium text-sm shadow-md hover:shadow-lg active:scale-95"
                            >
                                <SparklesIcon className="w-4 h-4 text-primary-foreground/70" />
                                {action}
                            </button>
                        ))}
                    </div>

                    {/* AI Insights Section */}
                    {job.analysis_json && (
                        <div className="bg-muted/30 rounded-xl p-5 border border-border">
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <BrainCircuitIcon className="w-4 h-4 text-primary" />
                                Match Analysis
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Matched Keywords</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {job.analysis_json.keywords_matched.slice(0, 5).map(k => (
                                            <span key={k} className="px-2 py-1 bg-background border border-emerald-500/20 text-emerald-600 text-xs rounded shadow-sm">{k}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Missing / Context Gaps</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {job.analysis_json.missing_keywords.slice(0, 3).map(k => (
                                            <span key={k} className="px-2 py-1 bg-background border border-amber-500/20 text-amber-600 text-xs rounded shadow-sm">{k}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline / Activity */}
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-4">Activity Log</h3>
                        <div className="border-l-2 border-border pl-4 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                                <p className="text-sm text-muted-foreground">Updated status to <span className="font-medium text-foreground">{job.status}</span></p>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                    {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
                                </span>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary/30 ring-4 ring-background" />
                                <p className="text-sm text-muted-foreground">Applied to role</p>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30 rounded-b-2xl flex justify-between items-center text-xs text-muted-foreground">
                    <span>ID: {job.id.slice(0, 8)}</span>
                    <button className="text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded transition-colors">Archive Application</button>
                </div>
            </div>
        </>
    )
}

function SparklesIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
}

function BrainCircuitIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit"><path d="M12 5a3 3 0 1 0-5.997.125 1 1 0 0 1-2.5 1A8 8 0 1 1 12 20v-2a6 6 0 1 0-6-6c0-1.657 1.343-2 3-2" /><path d="m16 8-4 4 4 4" /><path d="m20 8-4 4 4 4" /></svg>
}
