'use client'

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    resumeTitle: string;
    targetJobTitle: string;
    companyName: string;
    onSave: () => void;
    isSaving: boolean;
}

export default function OptimizationHeader({ resumeTitle, targetJobTitle, companyName, onSave, isSaving }: Props) {
    return (
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <span>{resumeTitle}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium text-indigo-600">Optimization Mode</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Targeting: {targetJobTitle} <span className="text-gray-400 font-normal">at {companyName}</span>
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Match Potential</div>
                    <div className="text-lg font-bold text-green-600 flex items-center justify-end gap-1">
                        <span>High</span>
                        <Sparkles className="h-4 w-4" />
                    </div>
                </div>
                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
                <Button
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
                >
                    {isSaving ? 'Saving Version...' : 'Save Optimized Resume'}
                </Button>
            </div>
        </div>
    )
}
