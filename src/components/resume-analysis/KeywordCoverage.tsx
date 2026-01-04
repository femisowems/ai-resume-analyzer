'use client'

import { Check, X } from 'lucide-react'

interface Props {
    present: string[]
    missing: string[]
}

export default function KeywordCoverage({ present, missing }: Props) {
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
                                <span key={kw} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded text-sm font-medium">
                                    {kw}
                                </span>
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
