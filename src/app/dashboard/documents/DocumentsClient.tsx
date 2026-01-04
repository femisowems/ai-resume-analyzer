'use client'

import { useState } from 'react'
import { FileText, Mail, Linkedin, Trash2, LayoutGrid, AlertTriangle } from 'lucide-react'
import { DocumentItem, deleteDocument } from './actions'

interface DocumentsClientProps {
    documents: DocumentItem[]
}

export default function DocumentsClient({ documents }: DocumentsClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'resume' | 'cover_letter' | 'thank_you'>('all')
    const [deletingDoc, setDeletingDoc] = useState<{ id: string, type: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const filteredDocs = activeTab === 'all'
        ? documents
        : documents.filter(doc => doc.type === activeTab)

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
                        <div className="flex items-center">
                            {getIcon(doc.type)}
                            <span className="ml-2 font-medium text-gray-900">
                                {getTypeLabel(doc.type)}
                            </span>
                        </div>
                        <button
                            onClick={() => setDeletingDoc({ id: doc.id, type: doc.type })}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Context Header */}
                    {(doc.companyName || doc.jobTitle) && (
                        <div className="mb-3 pb-3 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-800 text-sm">{doc.jobTitle}</h4>
                            <p className="text-xs text-gray-500">{doc.companyName}</p>
                        </div>
                    )}

                    {/* Resume specific display */}
                    {doc.type === 'resume' && (
                        <div className="mb-3 pb-3 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-800 text-sm">{doc.title}</h4>
                            <p className="text-xs text-gray-500">Uploaded Resume</p>
                        </div>
                    )}

                    <div className="flex-1">
                        {doc.content && (
                            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100 mb-4 font-mono text-xs">
                                {doc.content}
                            </p>
                        )}
                        {doc.type === 'resume' && (
                            <div className="bg-gray-50 p-3 rounded border border-gray-100 mb-4 flex items-center justify-center h-24 text-gray-400">
                                <FileText className="h-8 w-8 opacity-20" />
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-gray-400 mt-auto pt-3 flex justify-between items-center border-t border-gray-50">
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
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
                </div>
            ))}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'all', label: 'All Documents', icon: LayoutGrid },
                        { id: 'resume', label: 'Resumes', icon: FileText },
                        { id: 'cover_letter', label: 'Cover Letters', icon: FileText },
                        { id: 'thank_you', label: 'Thank You Emails', icon: Mail },
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

            {/* Content */}
            {filteredDocs.length > 0 ? (
                renderDocGrid(filteredDocs)
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No documents found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'all'
                            ? 'Get started by creating a document from your jobs.'
                            : `No ${activeTab.replace('_', ' ')}s found.`}
                    </p>
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
