'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import ResumeStatsCard from './components/ResumeStatsCard'
import BestResumeHighlight from './components/BestResumeHighlight'
import { compareResumesAction, analyzeResumeAction } from './actions'
import { Button } from "@/components/ui/button"

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
    const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set())
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async (resumeId: string) => {
        setAnalyzingIds(prev => new Set(prev).add(resumeId))
        setError(null)
        try {
            await analyzeResumeAction(resumeId)
        } catch (e) {
            console.error(e)
            setError("Analysis failed. Please ensure the resume file is valid.")
        } finally {
            setAnalyzingIds(prev => {
                const next = new Set(prev)
                next.delete(resumeId)
                return next
            })
        }
    }

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            if (selectedIds.length < 2) {
                setSelectedIds([...selectedIds, id])
            }
        }
        setError(null)
    }

    const handleCompare = async () => {
        if (selectedIds.length !== 2) return
        setIsComparing(true)
        setError(null)
        try {
            const result = await compareResumesAction(selectedIds[0], selectedIds[1])
            setComparisonResult(result)
        } catch (e: any) {
            console.error(e)
            setError(e.message || "Failed to compare resumes. Please try again.")
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
                                <span className="text-sm text-foreground font-medium">{selectedIds.length} selected</span>
                            </div>
                            <Button
                                onClick={handleCompare}
                                disabled={selectedIds.length !== 2 || isComparing}
                            >
                                {isComparing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                                        Analyzing...
                                    </>
                                ) : 'Run Comparison'}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setIsCompareMode(false)
                                    setSelectedIds([])
                                    setComparisonResult(null)
                                    setError(null)
                                }}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setIsCompareMode(true)}
                        >
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Compare Resumes
                        </Button>
                    )}

                    {!isCompareMode && (
                        <Button asChild>
                            <Link href="/dashboard/resumes/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Upload New
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                        !
                    </div>
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Comparison Modal / View */}
            {comparisonResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Comparison Results</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Winner: <span className="font-bold text-indigo-600">
                                        {comparisonResult.winner_id === 'A'
                                            ? resumes.find(r => r.id === selectedIds[0])?.title
                                            : comparisonResult.winner_id === 'B'
                                                ? resumes.find(r => r.id === selectedIds[1])?.title
                                                : 'Tie'}
                                    </span>
                                </p>
                            </div>
                            <button onClick={() => setComparisonResult(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8">
                            <h3 className="font-semibold text-indigo-900 mb-1">Executive Summary</h3>
                            <p className="text-indigo-800 leading-relaxed text-sm">{comparisonResult.summary}</p>
                            <div className="mt-3 pt-3 border-t border-indigo-100">
                                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Rationale</p>
                                <p className="text-indigo-900 text-sm">{comparisonResult.rationale}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">{resumes.find(r => r.id === selectedIds[0])?.title || 'Resume A'} Strengths</h3>
                                    {comparisonResult.winner_id === 'A' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">WINNER</span>}
                                </div>
                                <ul className="space-y-2">
                                    {comparisonResult.resume_a_strengths?.map((s: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">{resumes.find(r => r.id === selectedIds[1])?.title || 'Resume B'} Strengths</h3>
                                    {comparisonResult.winner_id === 'B' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">WINNER</span>}
                                </div>
                                <ul className="space-y-2">
                                    {comparisonResult.resume_b_strengths?.map((s: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {comparisonResult.ats_risks && comparisonResult.ats_risks.length > 0 && (
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-8">
                                <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                    <span className="text-lg">⚠️</span> ATS Risks Detected
                                </h3>
                                <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                                    {comparisonResult.ats_risks.map((risk: string, i: number) => (
                                        <li key={i}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Detailed Differences</h3>
                            <div className="grid gap-4">
                                {comparisonResult.differences.map((diff: any, idx: number) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 bg-gray-50/50">
                                        <div className="w-full md:w-1/4">
                                            <span className="inline-block px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded uppercase tracking-wider shadow-sm">
                                                {diff.category}
                                            </span>
                                            <div className="mt-2 text-sm font-medium text-gray-500">
                                                Advantage: <span className={diff.winner === 'A' ? 'text-blue-600 font-bold' : diff.winner === 'B' ? 'text-purple-600 font-bold' : 'text-gray-600'}>
                                                    {diff.winner === 'A'
                                                        ? resumes.find(r => r.id === selectedIds[0])?.title
                                                        : diff.winner === 'B'
                                                            ? resumes.find(r => r.id === selectedIds[1])?.title
                                                            : 'Tie'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 grid md:grid-cols-2 gap-4">
                                            <div className="bg-white p-3 rounded border border-gray-100 text-sm relative shadow-sm">
                                                <div className="absolute top-1 right-2 text-xs font-bold text-gray-300">A</div>
                                                <p className="text-gray-600 mt-1">{diff.resume_a_notes}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded border border-gray-100 text-sm relative shadow-sm">
                                                <div className="absolute top-1 right-2 text-xs font-bold text-gray-300">B</div>
                                                <p className="text-gray-600 mt-1">{diff.resume_b_notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100 flex gap-4">
                            <div className="text-2xl">💡</div>
                            <div>
                                <h3 className="font-bold text-green-900 mb-1">Final Recommendation</h3>
                                <p className="text-green-800 text-sm leading-relaxed">{comparisonResult.recommendation}</p>
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
                        <div
                            className={`transition-all duration-200 ${selectedIds.includes(resume.id)
                                ? 'ring-2 ring-indigo-500 rounded-xl transform scale-[1.02] shadow-md'
                                : isCompareMode ? 'opacity-70 hover:opacity-100' : ''
                                }`}
                        >
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
                                onAnalyze={() => handleAnalyze(resume.id)}
                                isAnalyzing={analyzingIds.has(resume.id)}
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
