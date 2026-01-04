// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card" 
import { ArrowRight, BarChart3, Briefcase, FileText, MoreVertical, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

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
}

export default function ResumeStatsCard({ resume, stats }: ResumeStatsCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    return (
        <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                            {resume.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Last active: {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(stats.atsScoreAvg)} flex items-center gap-1`}>
                            <BarChart3 className="w-3 h-3" />
                            {stats.atsScoreAvg > 0 ? `${stats.atsScoreAvg}%` : 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Applications</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-gray-900">{stats.applicationsCount}</span>
                            <span className="text-xs text-gray-400">used</span>
                        </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Interviews</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-gray-900">{stats.interviewCount}</span>
                            {stats.applicationsCount > 0 && (
                                <span className="text-xs text-green-600">
                                    {(stats.interviewCount / stats.applicationsCount * 100).toFixed(0)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Top Strengths</p>
                    <div className="flex flex-wrap gap-2">
                        {stats.topStrengths.length > 0 ? (
                            stats.topStrengths.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100 truncate max-w-[140px]">
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400 italic">No analysis yet</span>
                        )}
                        {stats.topStrengths.length > 2 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md border border-gray-200">
                                +{stats.topStrengths.length - 2}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500 font-medium">
                    v{resume.current_version_number}.0
                </div>
                <Link
                    href={`/dashboard/resumes/${resume.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                    View Analysis <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
