'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import ResumeStatsCard from './components/ResumeStatsCard'
import BestResumeHighlight from './components/BestResumeHighlight'
import { compareResumesAction } from './actions' // We will wire this up later

export interface ResumeWithStats {
    id: string
    title: string
    created_at: string
    current_version_number: number
    stats: {
        applicationsCount: number
        interviewCount: number
        atsScoreAvg: number
        topStrengths: string[]
    }
}

interface ResumesClientProps {
    resumes: ResumeWithStats[]
    bestResume: ResumeWithStats | null
}

export default function ResumesClient({ resumes, bestResume }: ResumesClientProps) {
    const [isCompareMode, setIsCompareMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [comparisonResult, setComparisonResult] = useState<any>(null)
    const [isComparing, setIsComparing] = useState(false)

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            if (selectedIds.length < 2) {
                setSelectedIds([...selectedIds, id])
            }
        }
    }

    const handleCompare = async () => {
        if (selectedIds.length !== 2) return
        setIsComparing(true)
        try {
            const result = await compareResumesAction(selectedIds[0], selectedIds[1])
            setComparisonResult(result)
        } catch (e) {
            console.error(e)
            alert("Failed to compare resumes")
        } finally {
            setIsComparing(false)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resume Intelligence</h1>
                    <p className="text-gray-500 mt-2">Manage, compare, and optimize your resumes for maximum impact.</p>
                </div>
                <div className="flex gap-3">
                    {isCompareMode ? (
                        <>
                            <div className="flex items-center gap-2 mr-2">
                                <span className="text-sm text-gray-600 font-medium">{selectedIds.length} selected</span>
                            </div>
                            <button
                                onClick={handleCompare}
                                disabled={selectedIds.length !== 2 || isComparing}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isComparing ? 'Analyzing...' : 'Run Comparison'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsCompareMode(false)
                                    setSelectedIds([])
                                    setComparisonResult(null)
                                }}
                                className="inline-flex items-center p-2 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsCompareMode(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Compare Resumes
                        </button>
                    )}

                    {!isCompareMode && (
                        <Link
                            href="/dashboard/resumes/new"
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Upload New
                        </Link>
                    )}
                </div>
            </div>

            {/* Comparison Modal / View */}
            {comparisonResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Resume Comparison Analysis</h2>
                            <button onClick={() => setComparisonResult(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
                            <h3 className="font-semibold text-indigo-900 mb-2">Summary</h3>
                            <p className="text-indigo-800 leading-relaxed">{comparisonResult.summary}</p>
                        </div>

                        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-8">
                            <h3 className="font-semibold text-green-900 mb-2">Recommendation</h3>
                            <p className="text-green-800 leading-relaxed font-medium">{comparisonResult.recommendation}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Key Differences</h3>
                            <div className="grid gap-4">
                                {comparisonResult.differences.map((diff: any, idx: number) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4">
                                        <div className="w-full md:w-1/4">
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase tracking-wider">
                                                {diff.category}
                                            </span>
                                            <div className="mt-2 text-sm font-medium text-gray-500">
                                                Winner: <span className={diff.winner === 'A' ? 'text-blue-600' : diff.winner === 'B' ? 'text-purple-600' : 'text-gray-600'}>
                                                    {diff.winner === 'A' ? 'Resume A' : diff.winner === 'B' ? 'Resume B' : 'Tie'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 grid md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded text-sm relative">
                                                <div className="absolute top-1 right-2 text-xs font-bold text-gray-300">A</div>
                                                {diff.resume_a_notes}
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded text-sm relative">
                                                <div className="absolute top-1 right-2 text-xs font-bold text-gray-300">B</div>
                                                {diff.resume_b_notes}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isCompareMode && bestResume && (
                <BestResumeHighlight
                    resume={{
                        id: bestResume.id,
                        title: bestResume.title,
                        updated_at: bestResume.created_at
                    }}
                    metrics={{
                        score: bestResume.stats.atsScoreAvg,
                        interviewRate: bestResume.stats.applicationsCount > 0
                            ? `${Math.round((bestResume.stats.interviewCount / bestResume.stats.applicationsCount) * 100)}%`
                            : '0%',
                        totalApplications: bestResume.stats.applicationsCount
                    }}
                    aiReasoning={
                        bestResume.stats.interviewCount > 0
                            ? "This resume is driving actual interviews. Keep using it for similar roles."
                            : "This resume has the strongest keyword optimization among your files."
                    }
                />
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resumes.map((resume) => (
                    <div key={resume.id} className="relative group">
                        {isCompareMode && (
                            <div className="absolute top-4 right-4 z-20">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(resume.id)}
                                    onChange={() => toggleSelection(resume.id)}
                                    className="w-6 h-6 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                />
                            </div>
                        )}
                        <div className={selectedIds.includes(resume.id) ? 'ring-2 ring-indigo-500 rounded-xl' : ''}>
                            <ResumeStatsCard
                                resume={{
                                    id: resume.id,
                                    title: resume.title,
                                    updated_at: resume.created_at,
                                    current_version_number: resume.current_version_number
                                }}
                                stats={{
                                    atsScoreAvg: resume.stats.atsScoreAvg,
                                    applicationsCount: resume.stats.applicationsCount,
                                    interviewCount: resume.stats.interviewCount,
                                    topStrengths: resume.stats.topStrengths
                                }}
                            />
                        </div>
                    </div>
                ))}

                {resumes.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-medium text-gray-900">No resumes yet</h3>
                            <p className="text-gray-500 mt-2 mb-6">Upload your first resume to start analyzing your market value.</p>
                            <Link
                                href="/dashboard/resumes/new"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Upload Resume
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
