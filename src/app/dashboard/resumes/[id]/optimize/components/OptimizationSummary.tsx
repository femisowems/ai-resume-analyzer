'use client'

import { AlertCircle, CheckCircle2, Target } from "lucide-react";

interface Props {
    summary: {
        why_mismatched: string;
        focus: string;
    }
}

export default function OptimizationSummary({ summary }: Props) {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Optimization Strategy
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-red-50 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Current Gap</div>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {summary.why_mismatched}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-50 shadow-sm">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                            <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Our Focus</div>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {summary.focus}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
