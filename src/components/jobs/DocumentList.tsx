'use client'

import Link from 'next/link'
import { FileText, ExternalLink } from 'lucide-react'
import { Document } from '@/lib/types'

interface DocumentListProps {
    documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
    if (documents.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <p className="text-sm text-gray-500">No documents linked to this job.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {documents.map((doc) => (
                <div key={doc.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <Link href={`/dashboard/documents/${doc.id}`} className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true" />
                            <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                            <p className="truncate text-sm text-gray-500">{doc.type}</p>
                        </Link>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
            ))}
        </div>
    )
}
