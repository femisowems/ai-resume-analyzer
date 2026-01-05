'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, Filter, Search, Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { DocumentItem, deleteDocument, linkDocumentToJob } from './actions'
import { DocumentCard } from './components/DocumentCard'
import { IntelligenceSidebar } from './components/IntelligenceSidebar'
import { JobLinkModal } from './components/JobLinkModal'
import { DeleteDocumentDialog } from './components/DeleteDocumentDialog'
import { DocumentsTabs } from './components/DocumentsTabs'
import { DocumentTypeChips } from './components/DocumentTypeChips'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface DocumentsDashboardProps {
    documents: DocumentItem[]
}

export default function DocumentsDashboard({ documents }: DocumentsDashboardProps) {
    const searchParams = useSearchParams()
    const router = useRouter()

    // URL State
    const activeTab = searchParams.get('tab') || 'all'
    const activeType = searchParams.get('type')
    // Search is still local state for rapid typing, but could be URL synced debounced
    const [searchQuery, setSearchQuery] = useState('')

    const [linkingDoc, setLinkingDoc] = useState<DocumentItem | null>(null)
    const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null)

    // Filter Logic
    const filteredDocs = useMemo(() => {
        let result = documents

        // 1. Tab Logic (Workflow)
        if (activeTab === 'in-use') {
            result = result.filter(d =>
            (d.links && d.links.some(l =>
                ['APPLIED', 'RECRUITER_SCREEN', 'INTERVIEW', 'OFFER'].includes(l.status)
            ))
            )
        } else if (activeTab === 'needs-review') {
            result = result.filter(d => d.needsReviewReasons && d.needsReviewReasons.length > 0)
        }

        // 2. Type Filter
        if (activeType) {
            result = result.filter(d => d.type === activeType)
        }

        // 3. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(d =>
                d.title?.toLowerCase().includes(q) ||
                d.content?.toLowerCase().includes(q)
            )
        }

        return result
    }, [documents, activeTab, activeType, searchQuery])

    // Interaction Handlers
    const handleView = (doc: DocumentItem) => {
        router.push(`/dashboard/documents/${doc.id}`)
    }

    const handleDeleteClick = (id: string, type: string) => {
        const doc = documents.find(d => d.id === id)
        if (doc) setDeletingDoc(doc)
    }

    const handleConfirmDelete = async () => {
        if (!deletingDoc) return
        await deleteDocument(deletingDoc.id, deletingDoc.type)
        setDeletingDoc(null)
    }

    const handleLink = async (doc: DocumentItem) => {
        setLinkingDoc(doc)
    }

    // Helper for Empty State Message
    const getEmptyStateMessage = () => {
        if (activeTab === 'needs-review') return "You're in good shape! No documents need attention right now."
        if (activeTab === 'in-use') return "No active documents found. Link documents to job applications to see them here."
        return "No documents found."
    }

    return (
        <div className="flex min-h-screen bg-gray-50/30 -m-8">
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Document Hub
                            <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                2.0
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-1">Manage, analyze, and optimize your career artifacts.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white shadow-sm"
                            />
                        </div>
                        <Link
                            href="/dashboard/resumes/upload"
                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            New Upload
                        </Link>
                    </div>
                </div>

                {/* Navigation & Filters */}
                <div className="mb-8">
                    <DocumentsTabs />
                    <div className="flex items-center justify-between">
                        <DocumentTypeChips />
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap mb-6">
                            {filteredDocs.length} document{filteredDocs.length !== 1 && 's'}
                        </span>
                    </div>
                </div>

                {/* Content Grid */}
                {filteredDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="h-full">
                                <DocumentCard
                                    doc={doc}
                                    onView={handleView}
                                    onDelete={handleDeleteClick}
                                    onLink={handleLink}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'needs-review' ? (
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            ) : (
                                <Filter className="h-8 w-8 text-gray-300" />
                            )}
                        </div>
                        <h3 className="text-gray-900 font-medium text-lg">
                            {getEmptyStateMessage()}
                        </h3>
                        <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                            {activeTab === 'needs-review'
                                ? "All your documents meet relevance and quality standards."
                                : "Try adjusting your filters or search query to find what you're looking for."
                            }
                        </p>
                        {(activeType || searchQuery) && (
                            <button
                                onClick={() => {
                                    router.push(`?tab=${activeTab}`) // Clear type
                                    setSearchQuery('')
                                }}
                                className="mt-6 text-indigo-600 font-medium text-sm hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Right Sidebar - Keeps File Details visible when selecting? 
                Actually, removing Sidebar for now or keeping as global context helper.
                Let's keep it but make it smarter later. For now, it's just there.
             */}
            <IntelligenceSidebar documents={documents} />

            <DeleteDocumentDialog
                isOpen={!!deletingDoc}
                onClose={() => setDeletingDoc(null)}
                onConfirm={handleConfirmDelete}
                document={deletingDoc}
            />
        </div>
    )
}
