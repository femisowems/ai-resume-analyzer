'use client'

import { JobDocument, JobStatus, DocumentType } from '@/lib/types'
import { DocumentCard } from './DocumentCard'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface PostInterviewDocumentsProps {
    documents: JobDocument[]
    jobStage: JobStatus
    onGenerate: (type: DocumentType) => Promise<void>
    onRegenerate: (docId: string) => Promise<void>
    onView: (docId: string) => void
}

export function PostInterviewDocuments({
    documents,
    jobStage,
    onGenerate,
    onRegenerate,
    onView
}: PostInterviewDocumentsProps) {
    // Auto-expand if job is in interview stage or later
    const shouldAutoExpand = ['INTERVIEW', 'OFFER'].includes(jobStage)
    const [isExpanded, setIsExpanded] = useState(shouldAutoExpand)

    if (documents.length === 0) {
        return null
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Follow-Up & Post-Interview
                    </h3>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Optional
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {isExpanded && (
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map(doc => {
                            const contextHint = doc.document_type === 'thank_you_email'
                                ? 'Generate after interview'
                                : 'Use if no response after 7 days'

                            return (
                                <div key={doc.id} className="relative">
                                    <DocumentCard
                                        document={doc}
                                        variant="optional"
                                        onView={() => doc.document_id && onView(doc.document_id)}
                                        onRegenerate={doc.document_id ? () => onRegenerate(doc.id) : undefined}
                                    />
                                    {doc.status === 'missing' && (
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                            💡 {contextHint}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
