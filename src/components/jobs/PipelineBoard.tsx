'use client'

import { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Job, JobStatus } from '@/lib/types'
import { PipelineColumn } from './PipelineColumn'
import { JobCard } from './JobCard'
import { useJobStore } from '@/lib/store/useJobStore'
import { updateJobStatus } from '@/app/dashboard/jobs/actions'
import { createPortal } from 'react-dom'

interface PipelineBoardProps {
    onJobClick: (job: Job) => void
}

const COLUMNS: { id: JobStatus, title: string }[] = [
    { id: 'SAVED', title: 'Saved' },
    { id: 'APPLIED', title: 'Applied' },
    { id: 'RECRUITER_SCREEN', title: 'Recruiter Screen' },
    { id: 'INTERVIEW', title: 'Interview' },
    { id: 'OFFER', title: 'Offer' },
    { id: 'REJECTED', title: 'Rejected' },
]

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function PipelineBoard({ onJobClick }: PipelineBoardProps) {
    const jobs = useJobStore(state => state.jobs)
    const moveJob = useJobStore(state => state.moveJob)
    const updateJob = useJobStore(state => state.updateJob)

    // activeId is for the DragOverlay
    const [activeId, setActiveId] = useState<string | null>(null)
    const activeJob = activeId ? jobs.find(j => j.id === activeId) : null

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        })
    )

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    function handleDragOver(event: DragOverEvent) {
        // In a real kanban, handling DragOver for reordering across columns 
        // is complex. For now, we rely on DragEnd to "move" the item to the new column.
        // Visual sorting during drag across columns requires changing the local state 'items' 
        // to reflect the temporary position.
        // For simplicity in this iteration: We just show the overlay.
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        setActiveId(null)

        if (!over) return

        const jobId = active.id as string
        const activeJob = jobs.find(j => j.id === jobId)

        if (!activeJob) return

        // Dropped on a Column?
        const overId = over.id
        // Check if overId is a column ID or another item ID
        let newStatus: JobStatus | null = null

        // Is it a column?
        if (COLUMNS.some(c => c.id === overId)) {
            newStatus = overId as JobStatus
        } else {
            // It's probably another card, find which column that card belongs to
            const overJob = jobs.find(j => j.id === overId)
            if (overJob) {
                newStatus = overJob.status
            }
        }

        if (newStatus && newStatus !== activeJob.status) {
            // Optimistic update
            moveJob(jobId, newStatus)

            // Server update
            try {
                await updateJobStatus(jobId, newStatus)
            } catch (error) {
                console.error("Failed to update job status", error)
                // Revert? (In a real app, yes. For now, we trust optimistic)
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start min-w-[1400px]">
                {COLUMNS.map(col => (
                    <PipelineColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        jobs={jobs.filter(j => j.status === col.id)}
                        onJobClick={onJobClick}
                    />
                ))}
            </div>

            {/* Drag Overlay Portal */}
            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeJob ? (
                        <JobCard job={activeJob} onClick={() => { }} />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
