'use client'

import { useState } from 'react'
import { Check, X, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
    present: string[]
    missing: string[]
    onAddKeyword?: (keyword: string) => Promise<void>
}

function KeywordPill({ keyword, onAdd }: { keyword: string, onAdd?: (k: string) => Promise<void> }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter() // Revalidate? The action does it.

    const handleClick = async () => {
        if (!onAdd || loading) return
        setLoading(true)
        try {
            await onAdd(keyword)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
        // Optimistic update handled by parent prop change?
        // Actually, revalidatePath in action will refresh page, Props will update.
    }

    return (
        <button
            onClick={handleClick}
            disabled={!onAdd || loading}
            className="group px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded text-sm font-medium hover:bg-red-100 hover:border-red-200 transition-all flex items-center pr-1 gap-1"
        >
            {keyword}
            {onAdd && (
                <span className="ml-1 p-0.5 rounded-full bg-red-100 group-hover:bg-red-200 text-red-600 transition-colors">
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                </span>
            )}
        </button>
    )
}

export default function KeywordCoverage({ present, missing, onAddKeyword }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">ATS Keyword Map</h3>

            <div className="space-y-6">
                {/* Missing Keywords (Priority) */}
                <div>
                    <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {missing.length === 0 ? (
                            <span className="text-sm text-gray-400 italic">No major keywords missing. Great job!</span>
                        ) : (
                            missing.map(kw => (
                                <KeywordPill key={kw} keyword={kw} onAdd={onAddKeyword} />
                            ))
                        )}
                    </div>
                </div>

                {/* Present Keywords */}
                <div>
                    <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Found in Resume
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {present.map(kw => (
                            <span key={kw} className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded text-sm">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
