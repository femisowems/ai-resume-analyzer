'use client'

import { Job } from '@/lib/types'
import { PipelineBoard } from '@/components/jobs/PipelineBoard'
import { IntelligenceConsole } from '@/components/jobs/IntelligenceConsole'
import { useJobStore } from '@/lib/store/useJobStore'
import { useEffect, useState } from 'react'
import { JobActionDrawer } from '@/components/jobs/JobActionDrawer'
import QuickTrackModal from '@/components/jobs/QuickTrackModal'
import { Button } from '@/components/ui/button'

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
    const [isQuickTrackOpen, setIsQuickTrackOpen] = useState(false)

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header Area (Integrated here for State Access) */}
            <div className="flex-shrink-0 px-6 pt-6 pb-2 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Jobs</h1>
                    <p className="text-muted-foreground text-sm">Track and manage your applications</p>
                </div>
                <Button
                    onClick={() => setIsQuickTrackOpen(true)}
                    className="shadow-sm"
                >
                    + Quick Track
                </Button>
            </div>

            {/* Top Intelligence Layer */}
            <IntelligenceConsole jobs={displayJobs} />

            {/* Kanban Pipeline */}
            <div className="flex-1 overflow-x-auto overflow-y-auto px-6 pb-6">
                <PipelineBoard onJobClick={handleJobClick} />
            </div>

            {/* Slid-over Drawer */}
            <JobActionDrawer
                job={selectedJob}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
            />

            {/* Quick Track Modal */}
            <QuickTrackModal
                isOpen={isQuickTrackOpen}
                onClose={() => setIsQuickTrackOpen(false)}
            />
        </div>
    )
}
