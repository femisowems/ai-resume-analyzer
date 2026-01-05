'use client'

import { JobDocument, DocumentType } from '@/lib/types'
import { DocumentCard } from './DocumentCard'
import { Plus } from 'lucide-react'

interface RequiredDocumentsProps {
    documents: JobDocument[]
    onRegenerate: (docId: string) => Promise<void>
    onView: (docId: string) => void
    onGenerate: (type: DocumentType) => Promise<void>
}

export function RequiredDocuments({ documents, onRegenerate, onView, onGenerate }: RequiredDocumentsProps) {
    // Check if cover letter exists
    const coverLetter = documents.find(d => d.document_type === 'cover_letter')
    const hasCoverLetter = coverLetter && coverLetter.document_id

    return (
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Required Documents
                </h3>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Must have before applying
                </span>
            </div>

            {documents.length === 0 || !hasCoverLetter ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <div className="max-w-sm mx-auto">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-4">
                            <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Cover Letter Yet
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Cover letters increase response rates by 40%. Generate one tailored to this job in seconds.
                        </p>
                        <button
                            onClick={() => onGenerate('cover_letter')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Generate Cover Letter
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map(doc => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            variant="required"
                            onView={() => onView(doc.id)}
                            onRegenerate={() => onRegenerate(doc.id)}
                            onGenerate={() => onGenerate(doc.document_type)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
