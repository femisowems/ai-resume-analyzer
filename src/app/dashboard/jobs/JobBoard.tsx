'use client'

import { Job } from '@/lib/types'
import { PipelineBoard } from '@/components/jobs/PipelineBoard'
import { IntelligenceConsole } from '@/components/jobs/IntelligenceConsole'
import { useJobStore } from '@/lib/store/useJobStore'
import { useEffect, useState } from 'react'
import { JobActionDrawer } from '@/components/jobs/JobActionDrawer'

interface JobBoardProps {
    initialJobs: Job[]
}

export default function JobBoard({ initialJobs }: JobBoardProps) {
    const setJobs = useJobStore((state) => state.setJobs)
    const jobs = useJobStore((state) => state.jobs)

    // Selection State
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Initialize Store
    useEffect(() => {
        setJobs(initialJobs)
    }, [initialJobs, setJobs])

    const handleJobClick = (job: Job) => {
        setSelectedJob(job)
        setIsDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setTimeout(() => setSelectedJob(null), 300) // Clear after animation
    }

    // Use the store's jobs for rendering to ensure updates are reflected
    const displayJobs = jobs.length > 0 ? jobs : initialJobs

    return (
        <div className="flex flex-col h-full">
            {/* Top Intelligence Layer */}
            <IntelligenceConsole jobs={displayJobs} />

            {/* Kanban Pipeline */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <PipelineBoard onJobClick={handleJobClick} />
            </div>

            {/* Slid-over Drawer */}
            <JobActionDrawer
                job={selectedJob}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
            />
        </div>
    )
}
