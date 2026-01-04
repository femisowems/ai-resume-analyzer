'use client'

import { useState, useMemo } from 'react'
import { FileText, Mail, Linkedin, Trash2, LayoutGrid, AlertTriangle, Eye, X, Copy, Check, ArrowUpDown, Filter } from 'lucide-react'
import { DocumentItem, deleteDocument } from './actions'

interface DocumentsClientProps {
    documents: DocumentItem[]
}

export default function DocumentsClient({ documents }: DocumentsClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'resume' | 'cover_letter' | 'thank_you'>('all')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [jobTitleFilter, setJobTitleFilter] = useState<string>('all')
    const [companyFilter, setCompanyFilter] = useState<string>('all')
    const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null)
    const [deletingDoc, setDeletingDoc] = useState<{ id: string; type: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [copied, setCopied] = useState(false)
    // Extract unique job titles (Global)
    const jobTitles = useMemo(() => {
        const unique = new Set(documents.map(d => d.jobTitle).filter(Boolean) as string[])
        return Array.from(unique).sort()
    }, [documents])

    // Extract unique companies (Global)
    const companies = useMemo(() => {
        const unique = new Set(documents.map(d => d.companyName).filter(Boolean) as string[])
        return Array.from(unique).sort()
    }, [documents])

    const filteredDocs = useMemo(() => {
        return documents
            .filter(doc => activeTab === 'all' || doc.type === activeTab)
            .filter(doc => jobTitleFilter === 'all' || doc.jobTitle === jobTitleFilter)
            .filter(doc => companyFilter === 'all' || doc.companyName === companyFilter)
            .sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
            })
    }, [documents, activeTab, jobTitleFilter, companyFilter, sortOrder])

    const handleDelete = async () => {
        if (!deletingDoc) return
        setIsDeleting(true)
        try {
            await deleteDocument(deletingDoc.id, deletingDoc.type)
            setDeletingDoc(null)
        } catch (error) {
            console.error('Delete failed', error)
            alert('Failed to delete document')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCopy = () => {
        if (!viewingDoc?.content) return
        navigator.clipboard.writeText(viewingDoc.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'cover_letter':
                return <FileText className="h-5 w-5 text-indigo-600" />
            case 'thank_you':
                return <Mail className="h-5 w-5 text-green-600" />
            case 'linkedin':
                return <Linkedin className="h-5 w-5 text-blue-600" />
            default:
                return <FileText className="h-5 w-5 text-gray-600" />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'cover_letter':
                return 'Cover Letter'
            case 'thank_you':
                return 'Thank-You Email'
            case 'linkedin':
                return 'LinkedIn Optimization'
            case 'resume':
                return 'Resume'
            default:
                return type
        }
    }

    const renderDocGrid = (docs: DocumentItem[]) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
                <div key={doc.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition flex flex-col h-full animate-in fade-in duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center overflow-hidden">
                            <div className="flex-shrink-0 mr-3">
                                {getIcon(doc.type)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 leading-tight">
                                    {getTypeLabel(doc.type)}
                                </span>
                                <span className="font-medium text-gray-900 truncate text-sm" title={doc.type === 'resume' ? doc.title : (doc.jobTitle || getTypeLabel(doc.type))}>
                                    {doc.type === 'resume' ? doc.title : (doc.jobTitle || getTypeLabel(doc.type))}
                                </span>
                                {doc.type !== 'resume' && doc.companyName && (
                                    <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wide truncate mt-0.5">
                                        {doc.companyName}
                                    </span>
                                )}
                                {doc.type === 'resume' && (
                                    <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wide truncate mt-0.5">
                                        Uploaded Resume
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                            {doc.content && (
                                <button
                                    onClick={() => setViewingDoc(doc)}
                                    className="text-gray-400 hover:text-indigo-600 transition p-1"
                                    title="View"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setDeletingDoc({ id: doc.id, type: doc.type })}
                                className="text-gray-400 hover:text-red-600 transition p-1"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>



                    <div className="flex-1">
                        {doc.content && (
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => setViewingDoc(doc)}
                            >
                                <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100 mb-4 font-mono text-xs hover:bg-gray-100 transition-colors">
                                    {doc.content}
                                </p>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/5 rounded pointer-events-none">
                                    <span className="bg-white px-2 py-1 rounded shadow text-xs font-medium text-gray-700">Click to view</span>
                                </div>
                            </div>
                        )}
                        {doc.type === 'resume' && !doc.content && (
                            <div className="bg-gray-50 p-3 rounded border border-gray-100 mb-4 flex items-center justify-center h-24 text-gray-400">
                                <FileText className="h-8 w-8 opacity-20" />
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-gray-400 mt-auto pt-3 flex justify-between items-center border-t border-gray-50">
                        <span>
                            {doc.createdAt
                                ? new Date(doc.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })
                                : 'Date available'}
                        </span>
                        {doc.type === 'resume' && doc.downloadUrl ? (
                            <a
                                href={doc.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline flex items-center"
                            >
                                <FileText className="h-3 w-3 mr-1" />
                                View File
                            </a>
                        ) : doc.type === 'resume' ? (
                            <span className="text-gray-400">File unavailable</span>
                        ) : null}
                    </div>
                </div >
            ))
            }
        </div >
    )

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'all', label: 'All Documents', icon: LayoutGrid },
                        { id: 'cover_letter', label: 'Cover Letters', icon: FileText },
                        { id: 'thank_you', label: 'Thank You Emails', icon: Mail },
                        { id: 'resume', label: 'Resumes', icon: FileText },
                    ].map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                                    ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon className={`
                                    -ml-0.5 mr-2 h-5 w-5
                                    ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                                `} />
                                {tab.label}
                                <span className={`
                                    ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                                    ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'}
                                `}>
                                    {tab.id === 'all'
                                        ? documents.length
                                        : documents.filter(d => d.type === tab.id).length}
                                </span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                <div className="flex flex-col space-y-4 w-full sm:w-auto mb-4 sm:mb-0 max-w-[70%]">
                    {/* Job Title Filter */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar mask-gradient">
                        <span className="text-xs font-semibold text-gray-500 mr-2 whitespace-nowrap">Role:</span>
                        <button
                            onClick={() => setJobTitleFilter('all')}
                            className={`
                                whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                                ${jobTitleFilter === 'all'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }
                            `}
                        >
                            All Roles
                        </button>
                        {jobTitles.map(title => (
                            <button
                                key={title}
                                onClick={() => setJobTitleFilter(title)}
                                className={`
                                    whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors max-w-[200px] truncate
                                    ${jobTitleFilter === title
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                    }
                                `}
                                title={title}
                            >
                                {title}
                            </button>
                        ))}
                    </div>

                    {/* Company Filter */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar mask-gradient border-t border-gray-100 pt-2">
                        <span className="text-xs font-semibold text-gray-500 mr-2 whitespace-nowrap">Company:</span>
                        <button
                            onClick={() => setCompanyFilter('all')}
                            className={`
                                whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                                ${companyFilter === 'all'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }
                            `}
                        >
                            All Companies
                        </button>
                        {companies.map(company => (
                            <button
                                key={company}
                                onClick={() => setCompanyFilter(company)}
                                className={`
                                    whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                                    ${companyFilter === company
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                    }
                                `}
                            >
                                {company}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end px-2">
                    <span className="text-xs text-gray-500 font-medium">
                        {filteredDocs.length} result{filteredDocs.length !== 1 ? 's' : ''}
                    </span>
                    <div className="h-4 w-px bg-gray-200" />
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
                    >
                        <ArrowUpDown className="h-4 w-4 mr-1.5" />
                        Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                    </button>
                </div>
            </div>

            {/* Content */}
            {filteredDocs.length > 0 ? (
                renderDocGrid(filteredDocs)
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No documents match your filters</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        We couldn't find any documents that match your current selection. Try adjusting the filters or search criteria.
                    </p>

                    {(activeTab !== 'all' || jobTitleFilter !== 'all' || companyFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setActiveTab('all')
                                setJobTitleFilter('all')
                                setCompanyFilter('all')
                            }}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
                        >
                            <X className="h-4 w-4 mr-2 text-gray-400" />
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* View Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setViewingDoc(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    {getIcon(viewingDoc.type)}
                                    {getTypeLabel(viewingDoc.type)}
                                </h3>
                                {(viewingDoc.companyName || viewingDoc.jobTitle) && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {viewingDoc.jobTitle} • {viewingDoc.companyName}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                                    {viewingDoc.content}
                                </pre>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                            <button
                                onClick={handleCopy}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2 text-green-600" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Text
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Modal */}
            {deletingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => !isDeleting && setDeletingDoc(null)}
                    />

                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-lg font-semibold leading-6 text-gray-900">Delete {deletingDoc.type === 'resume' ? 'Resume' : 'Document'}?</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this? This action cannot be undone and will permanently remove the data{deletingDoc.type === 'resume' ? ' and file' : ''}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50"
                                onClick={() => setDeletingDoc(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
