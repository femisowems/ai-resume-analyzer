'use client'

import { Job } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CalendarClock, MoreHorizontal } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { CompanyLogo } from '@/components/ui/CompanyLogo'

interface JobCardProps {
    job: Job
    onClick: () => void
}

export function JobCard({ job, onClick }: JobCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: job.id,
        data: { job }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    // Calculate urgency or specialized styling
    const daysInStage = job.updated_at
        ? Math.floor((new Date().getTime() - new Date(job.updated_at).getTime()) / (1000 * 3600 * 24))
        : 0

    // Status color pill logic
    const getStatusColor = () => {
        if (daysInStage > 14) return 'bg-destructive/10 text-destructive border-destructive/20'
        if (daysInStage > 7) return 'bg-amber-50 text-amber-700 border-amber-200'
        return 'bg-secondary text-secondary-foreground border-transparent'
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={cn(
                "group relative bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50 shadow-xl scale-105 z-50",
                job.match_score && job.match_score > 85 && "border-l-4 border-l-emerald-500" // High match indicator
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <CompanyLogo
                        jobId={job.id}
                        companyName={job.company_name}
                        logoUrl={job.company_logo || job.company_logo_cache}
                        size={40}
                        className="flex-shrink-0 rounded-md"
                    />
                    <div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{job.role}</h3>
                        <p className="text-xs text-muted-foreground font-medium truncate max-w-[120px] mt-0.5">{job.company_name}</p>
                    </div>
                </div>
                <button
                    className="p-1 text-muted-foreground hover:text-foreground rounded bg-transparent hover:bg-secondary"
                    onClick={(e) => {
                        e.stopPropagation()
                        // Open menu
                    }}
                >
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className={cn("text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1", getStatusColor())}>
                    <CalendarClock size={12} />
                    {job.next_action_date ? (
                        <span>Due {formatDistanceToNow(new Date(job.next_action_date), { addSuffix: true })}</span>
                    ) : (
                        <span>{daysInStage}d in stage</span>
                    )}
                </div>

                {job.match_score && (
                    <div className="text-[10px] font-bold text-muted-foreground">
                        {job.match_score}% Match
                    </div>
                )}
            </div>

            {/* Hover Actions Overlay (Desktop) */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-lg opacity-0 group-hover:opacity-100" />
        </div>
    )
}

