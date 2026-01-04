import { create } from 'zustand'
import { Job, JobStatus } from '@/lib/types'

interface JobState {
    jobs: Job[]
    setJobs: (jobs: Job[]) => void
    moveJob: (jobId: string, newStatus: JobStatus) => void
    updateJob: (jobId: string, updates: Partial<Job>) => void
    addJob: (job: Job) => void
    removeJob: (jobId: string) => void
}

export const useJobStore = create<JobState>((set) => ({
    jobs: [],

    setJobs: (jobs) => set({ jobs }),

    // Optimistic move
    moveJob: (jobId, newStatus) => set((state) => ({
        jobs: state.jobs.map((job) =>
            job.id === jobId
                ? { ...job, status: newStatus, updated_at: new Date().toISOString() }
                : job
        )
    })),

    updateJob: (jobId, updates) => set((state) => ({
        jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, ...updates } : job
        )
    })),

    addJob: (job) => set((state) => ({
        jobs: [job, ...state.jobs]
    })),

    removeJob: (jobId) => set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== jobId)
    })),
}))
