'use client'

import { ContextAction } from '@/lib/types'
import { Sparkles, ArrowRight } from 'lucide-react'

interface ContextActionsProps {
    actions: ContextAction[]
    onActionClick: (action: ContextAction) => void
    isLoading?: boolean
}

export function ContextActions({ actions, onActionClick, isLoading }: ContextActionsProps) {
    if (isLoading) {
        return (
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100 animate-pulse">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="flex gap-3 mt-2">
                            <div className="h-12 bg-gray-200 rounded w-32" />
                            <div className="h-12 bg-gray-200 rounded w-32" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (actions.length === 0) {
        return null
    }

    const primaryAction = actions.find(a => a.priority === 'primary')
    const secondaryAction = actions.find(a => a.priority === 'secondary')

    return (
        <div className="sticky bottom-0 bg-primary text-primary-foreground rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-primary-foreground mb-1">
                        Recommended Next Action
                    </h3>
                    <p className="text-sm text-primary-foreground/80 mb-4">
                        AI-powered suggestion based on your application stage
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {primaryAction && (
                            <button
                                onClick={() => onActionClick(primaryAction)}
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-background hover:bg-muted transition-colors"
                            >
                                {primaryAction.label}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        )}
                        {secondaryAction && (
                            <button
                                onClick={() => onActionClick(secondaryAction)}
                                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-foreground/20 text-base font-medium rounded-md text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                            >
                                {secondaryAction.label}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

