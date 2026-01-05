'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, Filter, Search, Plus, Sparkles } from 'lucide-react'
import { DocumentItem, deleteDocument, linkDocumentToJob } from './actions'
import { DocumentCard } from './components/DocumentCard'
import { IntelligenceSidebar } from './components/IntelligenceSidebar'
import { JobLinkModal } from './components/JobLinkModal'

import Link from 'next/link'

interface DocumentsDashboardProps {
    documents: DocumentItem[]
}

type TabType = 'all' | 'active' | 'draft' | 'needs_review'

export default function DocumentsDashboard({ documents }: DocumentsDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [linkingDoc, setLinkingDoc] = useState<DocumentItem | null>(null)

    // Quick filtering logic
    const filteredDocs = useMemo(() => {
        let result = documents

        // Tab Filter
        if (activeTab === 'active') {
            result = result.filter(d => d.status === 'active' || (d.links && d.links.length > 0))
        } else if (activeTab === 'draft') {
            result = result.filter(d => d.status === 'draft' && (!d.links || d.links.length === 0))
        } else if (activeTab === 'needs_review') {
            result = result.filter(d => d.aiAnalysis && d.aiAnalysis.personalization_score < 60)
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(d =>
                d.title?.toLowerCase().includes(q) ||
                d.content?.toLowerCase().includes(q)
            )
        }

        return result
    }, [documents, activeTab, searchQuery])

    // Interaction Handlers (Placeholders for complex modals)
    const handleView = (doc: DocumentItem) => {
        console.log('View', doc)
        // TODO: Open View Modal (Re-implement from DocumentsClient)
        alert('View/Edit functionality is being upgraded. Please wait for the next update.')
    }

    const handleDelete = async (id: string, type: string) => {
        if (confirm('Are you sure you want to archive/delete this document?')) {
            await deleteDocument(id, type)
        }
    }

    const handleLink = async (doc: DocumentItem) => {
        setLinkingDoc(doc)
    }

    return (
        <div className="flex min-h-screen bg-gray-50/30 -m-8">
            {/* Negative margin to break out of parent padding if needed, or adjust parent */}
            {/* We assume parent wrapper has padding, but for full sidebar layout we might want to take over. 
            For now, stick to fluid layout within wrapper.
        */}

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Document Hub
                            <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                Beta
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-1">Manage, analyze, and optimize your career artifacts.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white shadow-sm"
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

                {/* AI Summary Banner */}
                <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-white rounded-xl border border-indigo-100 flex items-start gap-4 shadow-sm">
                    <div className="bg-white p-2 rounded-lg border border-indigo-50 shadow-sm shrink-0">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Intelligence Summary</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            You have <span className="font-semibold text-gray-900">{documents.filter(d => d.status === 'active' || d.links?.length).length} active documents</span> in your pipeline.
                            Consider analyzing your "Frontend Cover Letter" to improve its personalization score (currently 40%).
                        </p>
                    </div>
                </div>

                {/* Smart Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
                    {[
                        { id: 'all', label: 'All Documents' },
                        { id: 'active', label: 'Active (In Use)' },
                        { id: 'draft', label: 'Drafts' },
                        { id: 'needs_review', label: 'Needs Review' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`pb-4 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                ? 'text-indigo-600 border-indigo-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                {filteredDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="h-full">
                                <DocumentCard
                                    doc={doc}
                                    onView={handleView}
                                    onDelete={handleDelete}
                                    onLink={handleLink}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-medium">No documents found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <IntelligenceSidebar documents={documents} />

            <JobLinkModal
                isOpen={!!linkingDoc}
                onClose={() => setLinkingDoc(null)}
                document={linkingDoc}
            />

        </div>
    )
}
