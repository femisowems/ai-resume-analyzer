'use client'

import { Modal } from '@/components/ui/Modal'
import { Copy, Check, FileText, Mail, FileSearch } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/lib/toast'
import { JobDocument } from '@/lib/types'

interface DocumentViewerModalProps {
    isOpen: boolean
    onClose: () => void
    document: JobDocument | null
}

export function DocumentViewerModal({
    isOpen,
    onClose,
    document
}: DocumentViewerModalProps) {
    const [copied, setCopied] = useState(false)

    if (!document) return null

    const handleCopy = () => {
        if (!document.document?.content) return
        navigator.clipboard.writeText(document.document.content)
        setCopied(true)
        toast.success('Copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

    const getIcon = () => {
        switch (document.document_type) {
            case 'cover_letter': return <FileText className="w-5 h-5 text-indigo-500" />
            case 'thank_you_email': return <Mail className="w-5 h-5 text-green-500" />
            case 'follow_up_email': return <Mail className="w-5 h-5 text-blue-500" />
            default: return <FileSearch className="w-5 h-5 text-slate-500" />
        }
    }

    const title = document.document_type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="2xl"
        >
            <div className="flex flex-col h-full max-h-[70vh]">
                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 min-h-[400px]">
                        {document.document?.content ? (
                            <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-sm">
                                {document.document.content}
                            </pre>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400 italic">
                                <FileSearch className="w-12 h-12 mb-4 opacity-20" />
                                <p>No content available for this document.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        {getIcon()}
                        <span>Document ID: {document.document_id?.slice(0, 8)}...</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleCopy}
                            disabled={!document.document?.content}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Text
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
