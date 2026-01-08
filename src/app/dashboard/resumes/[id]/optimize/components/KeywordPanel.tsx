'use client'

import { AlertTriangle, CheckCircle, Search } from "lucide-react";

interface KeywordAnalysis {
    missing: string[];
    weak: string[];
    placements: { keyword: string; placement: string; confidence: 'High' | 'Medium' | 'Low' }[];
}

interface Props {
    analysis: KeywordAnalysis;
}

export default function KeywordPanel({ analysis }: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="h-4 w-4" />
                ATS Keyword Check
            </h3>

            <div className="space-y-6">
                {/* Missing Keywords */}
                <div>
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" />
                        Missing Critical Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.missing.length > 0 ? (
                            analysis.missing.map((k, i) => (
                                <span key={i} className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-100 font-medium">
                                    {k}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-500 italic">No missing keywords detected. Great job!</span>
                        )}
                    </div>
                </div>

                {/* Suggestions */}
                <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" />
                        Optimization Success
                    </h4>
                    <div className="space-y-3">
                        {analysis.placements.slice(0, 5).map((p, i) => (
                            <div key={i} className="bg-gray-50 rounded p-2 text-xs flex items-center justify-between border border-gray-100">
                                <span className="font-medium text-gray-700">{p.keyword}</span>
                                <span className="text-gray-500">→ {p.placement}</span>
                            </div>
                        ))}
                        {analysis.placements.length > 5 && (
                            <div className="text-xs text-center text-gray-400 pt-1">
                                + {analysis.placements.length - 5} more optimized
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                    <strong>Why this matters:</strong> Applicant Tracking Systems (ATS) scan for these exact terms. We've naturally integrated them into your new resume version.
                </p>
            </div>
        </div>
    )
}
