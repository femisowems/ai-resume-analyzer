'use client'

import { AlertTriangle, ArrowRight, CheckCircle, Wand2 } from 'lucide-react'
import { Suggestion } from '@/lib/types'

interface Props {
    suggestions: Suggestion[]
}

function SeverityBadge({ level }: { level: string }) {
    switch (level) {
        case 'high':
            return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Critical</span>
        case 'medium':
            return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Warning</span>
        default:
            return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Tip</span>
    }
}

export default function ActionQueue({ suggestions }: Props) {
    if (!suggestions || suggestions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <h3 className="text-gray-900 font-semibold">All Clear!</h3>
                <p className="text-gray-500 text-sm">No critical issues found in your resume.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-indigo-600" />
                    Recommended Actions
                    <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{suggestions.length}</span>
                </h3>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
                {suggestions.map((item) => (
                    <div key={item.id} className="group border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all bg-white relative">
                        <div className="flex justify-between items-start mb-2">
                            <SeverityBadge level={item.severity} />
                            <span className="text-[10px] text-gray-400 font-mono uppercase">{item.type}</span>
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mb-3">Target: <span className="capitalize">{item.section_target}</span></p>

                        {/* Preview of fix on hover/expand could go here, for now just CTA */}
                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                            <button className="text-xs text-gray-500 hover:text-gray-900 font-medium">Dismiss</button>
                            <button className="flex items-center text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                <Wand2 className="h-3 w-3 mr-1.5" />
                                Fix Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                <button className="text-xs text-indigo-600 font-medium hover:underline">
                    View All Suggestions
                </button>
            </div>
        </div>
    )
}
