'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react'
// import { improveResumeSection } from '../actions' // We'll assume we export this or pass it

interface ImprovementPanelProps {
    resumeId: string
    improvements: string[]
}

export default function ImprovementPanel({ resumeId, improvements }: ImprovementPanelProps) {
    const [fixingIndex, setFixingIndex] = useState<number | null>(null)

    const handleFix = async (index: number, suggestion: string) => {
        setFixingIndex(index)
        // Simulation of API call
        try {
            // await improveResumeSection(resumeId, 'experience', suggestion) 
            // Logic to determine section is tricky without user input or smarter AI.
            // For this MVP, we will simulate the "Fix" action or just log it.
            await new Promise(resolve => setTimeout(resolve, 1500))
            alert(`Applied fix: "${suggestion}". (This is a simulation until backend rewrite logic is connected)`)
        } catch (e) {
            console.error(e)
        } finally {
            setFixingIndex(null)
        }
    }

    if (!improvements || improvements.length === 0) return null

    return (
        <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm mb-6">
            <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center justify-between">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Improvement Suggestions
                </h3>
                <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {improvements.length} actions available
                </span>
            </div>

            <div className="divide-y divide-gray-100">
                {improvements.map((suggestion, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 group">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-700 text-xs font-bold">{idx + 1}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{suggestion}</p>
                        </div>

                        <button
                            onClick={() => handleFix(idx, suggestion)}
                            disabled={fixingIndex !== null}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {fixingIndex === idx ? (
                                <>
                                    <Wand2 className="w-3 h-3 animate-spin" />
                                    Fixing...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-3 h-3" />
                                    Fix Now
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                <p className="text-xs text-gray-500">Fixes create a new version of your resume automatically.</p>
            </div>
        </div>
    )
}
