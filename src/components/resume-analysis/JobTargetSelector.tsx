'use client'

import { useState, useEffect } from 'react'
import { Briefcase, ChevronDown, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Job } from '@/lib/types'
import { cn } from '@/lib/utils'

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
                className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all border shadow-sm",
                    selectedJob
                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
                        : 'bg-background text-foreground border-border hover:border-primary/30 hover:bg-muted/50'
                )}
            >
                <Briefcase className={cn("h-4 w-4", selectedJob ? 'text-primary' : 'text-muted-foreground')} />
                <span className="font-medium max-w-[200px] truncate">
                    {selectedJob ? `${selectedJob.role} @ ${selectedJob.company_name}` : 'General Analysis (No Target)'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-popover rounded-lg shadow-xl border border-border py-1 z-50 max-h-96 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-border bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target A Job Application</p>
                    </div>

                    <button
                        onClick={() => handleSelect(null)}
                        className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 flex items-center justify-between group transition-colors"
                    >
                        <span className={!selectedJob ? 'font-semibold text-primary' : ''}>Generic / General Base</span>
                        {!selectedJob && <Check className="h-4 w-4 text-primary" />}
                    </button>

                    {jobs.map((job) => (
                        <button
                            key={job.id}
                            onClick={() => handleSelect(job.id)}
                            className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 flex items-center justify-between border-t border-border/50 transition-colors"
                        >
                            <div className="flex flex-col overflow-hidden mr-3">
                                <span className={cn("font-medium truncate", selectedJob?.id === job.id ? 'text-primary' : 'text-foreground')}>
                                    {job.role}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">{job.company_name}</span>
                            </div>
                            {selectedJob?.id === job.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
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

