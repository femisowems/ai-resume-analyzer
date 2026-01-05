'use client'

import { useState, useEffect } from 'react'
import { X, Search, Briefcase, Plus, Link as LinkIcon, Loader2 } from 'lucide-react'
import { DocumentItem, getLinkableJobs, LinkableJob, linkDocumentToJob } from '../actions'

interface JobLinkModalProps {
    isOpen: boolean
    onClose: () => void
    document: DocumentItem | null
}

export function JobLinkModal({ isOpen, onClose, document }: JobLinkModalProps) {
    const [jobs, setJobs] = useState<LinkableJob[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [linkingId, setLinkingId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            getLinkableJobs()
                .then(setJobs)
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [isOpen])

    if (!isOpen || !document) return null

    const filteredJobs = jobs.filter(j =>
        j.companyName.toLowerCase().includes(search.toLowerCase()) ||
        j.jobTitle.toLowerCase().includes(search.toLowerCase())
    )

    const handleLink = async (jobId: string) => {
        setLinkingId(jobId)
        try {
            await linkDocumentToJob(document.id, jobId)
            onClose()
        } catch (error) {
            alert('Failed to link')
        } finally {
            setLinkingId(null)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Link to Job</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Connect <span className="font-medium text-indigo-600">"{document.title}"</span> to an application.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search active jobs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-sm">Loading jobs...</span>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <div className="space-y-1">
                            {filteredJobs.map(job => {
                                const isLinked = document.links?.some(l => l.jobId === job.id)
                                return (
                                    <button
                                        key={job.id}
                                        onClick={() => !isLinked && handleLink(job.id)}
                                        disabled={isLinked || linkingId !== null}
                                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-all ${isLinked
                                                ? 'bg-indigo-50/50 border border-transparent opacity-70 cursor-default'
                                                : 'hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${isLinked ? 'bg-indigo-100 border-indigo-200' : 'bg-white border-gray-100 group-hover:border-gray-200'
                                                }`}>
                                                <Briefcase className={`h-5 w-5 ${isLinked ? 'text-indigo-600' : 'text-gray-500'}`} />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-semibold ${isLinked ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                    {job.jobTitle}
                                                </h4>
                                                <p className="text-xs text-gray-500">{job.companyName}</p>
                                            </div>
                                        </div>

                                        {linkingId === job.id ? (
                                            <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                                        ) : isLinked ? (
                                            <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200">
                                                Linked
                                            </span>
                                        ) : (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                                    <LinkIcon className="h-3 w-3" /> Link
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                <Briefcase className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-medium text-sm">No jobs found</p>
                            <p className="text-gray-500 text-xs mt-1 max-w-[200px]">
                                Try creating a new job application first.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
