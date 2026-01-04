'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, LayoutGrid, List as ListIcon, MoreHorizontal, FileText, Mail, ChevronRight } from 'lucide-react'
import { updateJobApplication } from './actions'
import DocumentGenerator from './[id]/DocumentGenerator'

type Job = {
    id: string
    company_name: string
    job_title: string
    status: string
    applied_date: string | null
    updated_at: string | null
    resume_version?: {
        resume?: {
            title: string
        }
    }
}

const STATUS_COLUMNS = [
    { id: 'applied', label: 'Applied', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { id: 'interview', label: 'Interview', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'offer', label: 'Offer', color: 'bg-green-50 border-green-200 text-green-700' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-50 border-red-200 text-red-700' },
]

export default function JobBoard({ initialJobs }: { initialJobs: Job[] }) {
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
    const [jobs, setJobs] = useState<Job[]>(initialJobs)
    const [draggingId, setDraggingId] = useState<string | null>(null)

    // Modal State
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [docType, setDocType] = useState<'cover_letter' | 'thank_you'>('cover_letter')
    const [showModal, setShowModal] = useState(false)

    const openGenerator = (job: Job, type: 'cover_letter' | 'thank_you') => {
        setSelectedJob(job)
        setDocType(type)
        setShowModal(true)
    }

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingId(id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, status: string) => {
        e.preventDefault()
        if (!draggingId) return

        const updatedJobs = jobs.map(j =>
            j.id === draggingId ? { ...j, status } : j
        )
        setJobs(updatedJobs)
        setDraggingId(null)

        // Server Action
        const formData = new FormData()
        formData.append('id', draggingId)
        formData.append('status', status)
        await updateJobApplication(formData)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
    }

    return (
        <div>
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ListIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={`p-2 rounded-md transition ${viewMode === 'board' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>

                <Link href="/dashboard/jobs/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Job
                </Link>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {jobs.length === 0 ? (
                            <li className="p-8 text-center text-gray-500">No job applications yet.</li>
                        ) : (
                            jobs.map((job) => (
                                <li key={job.id}>
                                    <div className="px-4 py-4 flex items-center sm:px-6">
                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="truncate">
                                                <div className="flex text-sm">
                                                    <p className="font-medium text-indigo-600 truncate">{job.job_title}</p>
                                                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">at {job.company_name}</p>
                                                </div>
                                                <div className="mt-2 flex">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <p>Applied: {formatDate(job.applied_date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                                                <div className="flex -space-x-1 overflow-hidden">
                                                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full uppercase tracking-wide
                                                        ${job.status === 'offer' ? 'bg-green-100 text-green-800' :
                                                            job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                job.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-indigo-100 text-indigo-800'}`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-5 flex-shrink-0 flex items-center space-x-2">
                                            <button
                                                onClick={() => openGenerator(job, 'cover_letter')}
                                                className="inline-flex items-center px-3 py-1 border border-indigo-200 shadow-sm text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                                title="Generate Cover Letter"
                                            >
                                                <div className="flex items-center">
                                                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                                                    Cover Letter
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => openGenerator(job, 'thank_you')}
                                                className="inline-flex items-center px-3 py-1 border border-indigo-200 shadow-sm text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                                title="Generate Thank You Email"
                                            >
                                                <div className="flex items-center">
                                                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                                                    Thank You
                                                </div>
                                            </button>
                                            <Link href={`/dashboard/jobs/${job.id}`} className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                                                <span>View Application</span>
                                                <ChevronRight className="ml-1.5 h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* Board View */}
            {viewMode === 'board' && (
                <div className="flex overflow-x-auto space-x-4 pb-4">
                    {STATUS_COLUMNS.map(col => (
                        <div
                            key={col.id}
                            className="bg-gray-50 rounded-lg p-3 min-w-[280px] w-full border border-gray-200 flex flex-col"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <h3 className={`font-semibold text-sm mb-3 px-2 py-1 rounded inline-block self-start ${col.color}`}>
                                {col.label}
                                <span className="ml-2 bg-white bg-opacity-50 px-1.5 rounded-full text-xs">
                                    {jobs.filter(j => j.status === col.id).length}
                                </span>
                            </h3>

                            <div className="space-y-3 flex-1">
                                {jobs.filter(j => j.status === col.id).map(job => (
                                    <div
                                        key={job.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, job.id)}
                                        className="bg-white p-3 rounded shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-gray-900 text-sm truncate">{job.job_title}</h4>
                                            <Link href={`/dashboard/jobs/${job.id}`}>
                                                <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition" />
                                            </Link>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{job.company_name}</p>
                                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => openGenerator(job, 'cover_letter')}
                                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                                    title="Generate Cover Letter"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openGenerator(job, 'thank_you')}
                                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                                    title="Generate Thank You Email"
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <p className="text-[10px] text-gray-400">{formatDate(job.updated_at || job.applied_date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showModal && selectedJob && (
                <DocumentGenerator
                    jobId={selectedJob.id}
                    jobTitle={selectedJob.job_title}
                    companyName={selectedJob.company_name}
                    resumeTitle={selectedJob.resume_version?.resume?.title}
                    initialTab={docType}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}
