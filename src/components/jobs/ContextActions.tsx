'use client'

import { ContextAction } from '@/lib/types'
import { Sparkles, ArrowRight } from 'lucide-react'

interface ContextActionsProps {
    actions: ContextAction[]
    onActionClick: (action: ContextAction) => void
}

export function ContextActions({ actions, onActionClick }: ContextActionsProps) {
    if (actions.length === 0) {
        return null
    }

    const primaryAction = actions.find(a => a.priority === 'primary')
    const secondaryAction = actions.find(a => a.priority === 'secondary')

    return (
        <div className="sticky bottom-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                        Recommended Next Action
                    </h3>
                    <p className="text-sm text-indigo-100 mb-4">
                        AI-powered suggestion based on your application stage
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {primaryAction && (
                            <button
                                onClick={() => onActionClick(primaryAction)}
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                            >
                                {primaryAction.label}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        )}
                        {secondaryAction && (
                            <button
                                onClick={() => onActionClick(secondaryAction)}
                                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors"
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
