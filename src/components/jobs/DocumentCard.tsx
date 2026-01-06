'use client'

import { JobDocument } from '@/lib/types'
import { FileText, Eye, RefreshCw, Clock, CheckCircle, AlertTriangle, XCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
                    label: 'Ready',
                    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
                    cardBorder: 'border-border'
                }
            case 'needs_update':
                return {
                    icon: AlertTriangle,
                    label: 'Needs Update',
                    color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
                    cardBorder: 'border-amber-500/50'
                }
            case 'draft':
                return {
                    icon: Clock,
                    label: 'Draft',
                    color: 'bg-secondary text-secondary-foreground border-border',
                    cardBorder: 'border-border border-dashed'
                }
            case 'missing':
                return {
                    icon: XCircle,
                    label: 'Missing',
                    color: 'bg-destructive/10 text-destructive border-destructive/20',
                    cardBorder: 'border-destructive/30 border-dashed'
                }
            default:
                return {
                    icon: FileText,
                    label: 'Unknown',
                    color: 'bg-secondary text-secondary-foreground border-border',
                    cardBorder: 'border-border'
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
        <div className={cn("bg-card border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow", statusConfig.cardBorder)}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-foreground">
                            {documentTypeLabel}
                        </h4>
                        {formattedDate && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {document.last_updated_at ? 'Updated' : 'Generated'} {formattedDate}
                            </p>
                        )}
                    </div>
                </div>
                <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", statusConfig.color)}>
                    {statusConfig.label}
                </span>
            </div>

            {document.status_reason && (
                <div className="mb-3 p-2 bg-secondary/50 rounded text-xs text-muted-foreground">
                    {document.status_reason}
                </div>
            )}

            <div className="flex gap-2">
                {document.document_id && onView && (
                    <button
                        onClick={onView}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-input text-sm font-medium rounded-md text-foreground bg-background hover:bg-secondary transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                    </button>
                )}
                {document.document_id && onRegenerate && (
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", isRegenerating && "animate-spin")} />
                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                )}
                {document.status === 'missing' && onGenerate && (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
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

