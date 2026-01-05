'use client'

import { JobDocument } from '@/lib/types'
import { FileText, Eye, RefreshCw, Clock, CheckCircle, AlertTriangle, XCircle, Plus } from 'lucide-react'
import { useState } from 'react'

interface DocumentCardProps {
    document: JobDocument
    variant: 'required' | 'optional'
    onView?: () => void
    onRegenerate?: () => Promise<void>
    onGenerate?: () => Promise<void>
}

export function DocumentCard({ document, variant, onView, onRegenerate, onGenerate }: DocumentCardProps) {
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleRegenerate = async () => {
        if (!onRegenerate) return
        setIsRegenerating(true)
        try {
            await onRegenerate()
        } finally {
            setIsRegenerating(false)
        }
    }

    const handleGenerate = async () => {
        if (!onGenerate) return
        setIsGenerating(true)
        try {
            await onGenerate()
        } finally {
            setIsGenerating(false)
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ready':
                return {
                    icon: CheckCircle,
                    label: '✅ Ready',
                    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800',
                    cardBorder: 'border-gray-300 dark:border-gray-700'
                }
            case 'needs_update':
                return {
                    icon: AlertTriangle,
                    label: '⚠ Needs Update',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800',
                    cardBorder: 'border-yellow-300 dark:border-yellow-700'
                }
            case 'draft':
                return {
                    icon: Clock,
                    label: '🕓 Draft',
                    color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                    cardBorder: 'border-gray-300 dark:border-gray-700 border-dashed'
                }
            case 'missing':
                return {
                    icon: XCircle,
                    label: '❌ Missing',
                    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800',
                    cardBorder: 'border-red-300 dark:border-red-700 border-dashed'
                }
            default:
                return {
                    icon: FileText,
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                    cardBorder: 'border-gray-300 dark:border-gray-700'
                }
        }
    }

    const statusConfig = getStatusConfig(document.status)
    const StatusIcon = statusConfig.icon

    const documentTypeLabel = document.document_type
        .replace('_', ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

    const formattedDate = document.last_updated_at
        ? new Date(document.last_updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : document.generated_at
            ? new Date(document.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null

    return (
        <div className={`bg-white dark:bg-gray-900 border-2 ${statusConfig.cardBorder} rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {documentTypeLabel}
                        </h4>
                        {formattedDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {document.last_updated_at ? 'Updated' : 'Generated'} {formattedDate}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
            </div>

            {document.status_reason && (
                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                    {document.status_reason}
                </div>
            )}

            <div className="flex gap-2">
                {document.document_id && onView && (
                    <button
                        onClick={onView}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                    </button>
                )}
                {document.document_id && onRegenerate && (
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                )}
                {document.status === 'missing' && onGenerate && (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                )}
            </div>
        </div>
    )
}
