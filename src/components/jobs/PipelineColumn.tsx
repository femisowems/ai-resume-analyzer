import { Job, JobStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { JobCard } from './JobCard'

interface PipelineColumnProps {
    id: JobStatus
    title: string
    jobs: Job[]
    onJobClick: (job: Job) => void
}

export function PipelineColumn({ id, title, jobs, onJobClick }: PipelineColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id
    })

    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col h-full max-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h3>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {jobs.length}
                    </span>
                </div>
            </div>

            {/* Droppable Area */}
            <div className="flex-1 bg-slate-50/50 rounded-xl p-2 border border-slate-200/60 overflow-y-auto min-h-[150px]">
                <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onClick={() => onJobClick(job)}
                            />
                        ))}
                    </div>
                </SortableContext>

                {jobs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic p-4 border-2 border-dashed border-slate-200 rounded-lg">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    )
}
