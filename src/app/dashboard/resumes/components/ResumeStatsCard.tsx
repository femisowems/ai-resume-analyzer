// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card" 
import { ArrowRight, BarChart3, Loader2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ResumeStatsCardProps {
    resume: {
        id: string
        title: string
        updated_at: string
        current_version_number: number
    }
    stats: {
        atsScoreAvg: number
        applicationsCount: number
        interviewCount: number
        topStrengths: string[]
    }
    analysisStatus?: 'pending' | 'processing' | 'completed' | 'failed'
    analysisError?: string | null
    onAnalyze?: () => void
    isAnalyzing?: boolean // Local optimistic state
}

export default function ResumeStatsCard({ resume, stats, analysisStatus, analysisError, onAnalyze, isAnalyzing }: ResumeStatsCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20'
        if (score >= 60) return 'text-amber-700 bg-amber-500/10 border-amber-500/20'
        return 'text-destructive bg-destructive/10 border-destructive/20'
    }

    // Determine effective status
    // If stats are present (atsScoreAvg > 0), we assume completed unless explicit status says otherwise (unlikely if score > 0)
    // Actually, if score > 0, it's analyzed.
    const hasAnalysis = stats.atsScoreAvg > 0

    // Status Logic:
    // 1. If local isAnalyzing -> show loading
    // 2. If status is processing -> show loading
    // 3. If stats exist -> show stats (completed)
    // 4. If status is failed -> show error
    // 5. Else -> show pending

    const isLoading = isAnalyzing || analysisStatus === 'processing'
    const isFailed = !isLoading && analysisStatus === 'failed'
    const isPending = !isLoading && !isFailed && !hasAnalysis

    return (
        <div className="group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0 flex-1 mr-4">
                        {hasAnalysis && !isLoading && !isFailed ? (
                            <Link href={`/dashboard/resumes/${resume.id}`} className="block group/link">
                                <h3 className="font-semibold text-lg text-foreground leading-tight group-hover/link:text-primary transition-colors truncate" title={resume.title}>
                                    {resume.title}
                                </h3>
                            </Link>
                        ) : (
                            <h3 className="font-semibold text-lg text-foreground leading-tight transition-colors truncate" title={resume.title}>
                                {resume.title}
                            </h3>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Last active: {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasAnalysis && (
                            <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1", getScoreColor(stats.atsScoreAvg))}>
                                <BarChart3 className="w-3 h-3" />
                                {stats.atsScoreAvg}%
                            </div>
                        )}
                    </div>
                </div>

                {/* State: Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-xl border border-dashed border-border h-40">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-sm font-medium text-primary">Running AI Analysis...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take 10-20s</p>
                    </div>
                )}

                {/* State: Failed */}
                {isFailed && (
                    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-xl border border-red-100 h-40">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-red-700 mb-1">Analysis Failed</p>
                        <p className="text-xs text-red-600 text-center mb-3 line-clamp-2 px-2" title={analysisError || 'Unknown error'}>
                            {analysisError || 'Please ensure the file is valid.'}
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-white hover:bg-red-50 border-red-200 text-red-700"
                            onClick={(e) => {
                                e.preventDefault()
                                onAnalyze?.()
                            }}
                        >
                            <RefreshCw className="w-3 h-3 mr-2" /> Retry
                        </Button>
                    </div>
                )}

                {/* State: Pending (Not Analyzed) */}
                {isPending && (
                    <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-xl border border-dashed border-border h-40">
                        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">AI Analysis Pending</p>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                onAnalyze?.()
                            }}
                            className="shadow-sm"
                        >
                            Analyze Resume
                        </Button>
                    </div>
                )}

                {/* State: Completed Stats */}
                {hasAnalysis && !isLoading && !isFailed && (
                    <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Applications</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-foreground">{stats.applicationsCount}</span>
                                    <span className="text-xs text-muted-foreground">used</span>
                                </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Interviews</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-foreground">{stats.interviewCount}</span>
                                    {stats.applicationsCount > 0 && (
                                        <span className="text-xs text-emerald-600">
                                            {(stats.interviewCount / stats.applicationsCount * 100).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Strengths</p>
                            <div className="flex flex-wrap gap-2">
                                {stats.topStrengths.length > 0 ? (
                                    stats.topStrengths.slice(0, 2).map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20 truncate max-w-[140px]">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">No analysis yet</span>
                                )}
                                {stats.topStrengths.length > 2 && (
                                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md border border-border">
                                        +{stats.topStrengths.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-muted/50 px-5 py-3 border-t border-border flex justify-between items-center mt-auto">
                <div className="text-xs text-muted-foreground font-medium">
                    v{resume.current_version_number}.0
                </div>
                {hasAnalysis && !isLoading && !isFailed && (
                    <Link
                        href={`/dashboard/resumes/${resume.id}`}
                        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                        View Analysis <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    )
}
