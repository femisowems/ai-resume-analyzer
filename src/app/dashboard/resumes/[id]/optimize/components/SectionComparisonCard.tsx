'use client'

import { Check, X, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    title: string;
    originalContent: any;
    newContent: any;
    isAccepted: boolean;
    onToggle: (accepted: boolean) => void;
    type: 'text' | 'list' | 'complex' // complex for experience/projects
}

export default function SectionComparisonCard({ title, originalContent, newContent, isAccepted, onToggle, type }: Props) {

    // Helper to render content based on type
    const renderContent = (content: any, isNew: boolean) => {
        if (!content) return <span className="text-gray-400 italic">Empty</span>;

        if (type === 'text') {
            return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
        }

        if (type === 'list') {
            // For skills usually
            if (typeof content === 'string') return <p className="text-sm">{content}</p>;
            if (Array.isArray(content)) {
                return (
                    <div className="flex flex-wrap gap-2">
                        {content.map((item: string, i: number) => (
                            <span key={i} className={cn(
                                "text-xs px-2 py-1 rounded border",
                                isNew ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-gray-50 border-gray-100 text-gray-700"
                            )}>
                                {item}
                            </span>
                        ))}
                    </div>
                )
            }
        }

        if (type === 'complex') {
            // Experience or Projects
            if (!Array.isArray(content)) return <p className="text-sm text-red-500">Invalid Data</p>;

            return (
                <div className="space-y-4">
                    {content.map((item: any, i: number) => (
                        <div key={i} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="text-sm font-bold text-gray-900">{item.role || item.name || item.degree}</h4>
                                <span className="text-xs text-gray-500">{item.duration || item.year}</span>
                            </div>
                            <div className="text-xs text-gray-600 mb-2 font-medium">{item.company || item.school}</div>
                            {item.bullets && (
                                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-gray-700">
                                    {item.bullets.map((b: string, idx: number) => (
                                        <li key={idx}>{b}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )
        }

        return null;
    }

    return (
        <div className={cn(
            "bg-white border rounded-xl overflow-hidden transition-all duration-300",
            isAccepted ? "border-green-200 shadow-md shadow-green-50/50 ring-1 ring-green-100" : "border-gray-200 shadow-sm"
        )}>
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{title}</h3>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button
                        onClick={() => onToggle(false)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all",
                            !isAccepted ? "bg-gray-100 text-gray-900 shadow-inner" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <RotateCcw className="h-3 w-3" />
                        Keep Original
                    </button>
                    <button
                        onClick={() => onToggle(true)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all",
                            isAccepted ? "bg-green-100 text-green-800 shadow-inner" : "text-gray-500 hover:text-green-600"
                        )}
                    >
                        <Check className="h-3 w-3" />
                        Accept AI Changes
                    </button>
                </div>
            </div>

            {/* Comparison Body */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                {/* Original Mobile / Left */}
                <div className={cn("p-6 transition-opacity", isAccepted && "opacity-50 grayscale-[50%]")}>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        Original
                    </div>
                    {renderContent(originalContent, false)}
                </div>

                {/* New Mobile / Right */}
                <div className={cn("p-6 bg-indigo-50/30 transition-all", isAccepted && "bg-green-50/30")}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="h-3 w-3" />
                            Optimized Version
                        </div>
                        {isAccepted && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                    {renderContent(newContent, true)}
                </div>
            </div>
        </div>
    )
}

function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
