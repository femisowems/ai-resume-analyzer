'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Printer, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { DocumentItem, deleteDocument } from '../actions'
import { DeleteDocumentDialog } from './DeleteDocumentDialog'

interface DocumentDetailActionsProps {
    document: DocumentItem
}

export function DocumentDetailActions({ document }: DocumentDetailActionsProps) {
    const router = useRouter()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const isPdf = document.type === 'resume'

    const primaryLink = document.links && document.links.length > 0 ? document.links[0] : null

    const confirmDelete = async () => {
        await deleteDocument(document.id, document.type)
        router.push('/dashboard/documents')
    }

    return (
        <div className="flex items-center gap-3 self-end md:self-start">
            {/* Download (PDF) */}
            {isPdf && document.downloadUrl && (
                <a
                    href={document.downloadUrl}
                    download
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                </a>
            )}

            {/* Print (Text) */}
            {!isPdf && (
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                </button>
            )}

            {/* View Job Link */}
            {primaryLink && (
                <Link
                    href={`/dashboard/jobs/${primaryLink.jobId}`}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition"
                >
                    View Job
                    <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
            )}

            {/* Delete Action */}
            <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 shadow-sm transition"
                title="Delete Document"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            <DeleteDocumentDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                document={document}
            />
        </div>
    )
}
