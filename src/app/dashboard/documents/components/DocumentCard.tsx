import { DocumentItem } from "../actions"
import { FileText, Mail, Linkedin, MoreVertical, Calendar, Briefcase, Zap, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react"
import { DocumentAnalysis } from "@/lib/types"

interface DocumentCardProps {
    doc: DocumentItem
    onView: (doc: DocumentItem) => void
    onDelete: (id: string, type: string) => void
    onLink: (doc: DocumentItem) => void
}

export function DocumentCard({ doc, onView, onDelete, onLink }: DocumentCardProps) {
    const isActive = doc.status === 'active' || (doc.links && doc.links.length > 0)

    // Helper to get tone color
    const getToneColor = (tone?: DocumentAnalysis['tone']) => {
        switch (tone) {
            case 'confident': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'formal': return 'bg-slate-100 text-slate-700 border-slate-200'
            case 'urgent': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'casual': return 'bg-green-100 text-green-700 border-green-200'
            default: return 'bg-gray-50 text-gray-600 border-gray-100'
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'cover_letter': return <FileText className="h-5 w-5 text-indigo-600" />
            case 'thank_you': return <Mail className="h-5 w-5 text-emerald-600" />
            case 'linkedin': return <Linkedin className="h-5 w-5 text-blue-600" />
            case 'resume': return <FileText className="h-5 w-5 text-fuchsia-600" />
            default: return <FileText className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col h-full animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                        {getIcon(doc.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1" title={doc.title}>
                            {doc.title || 'Untitled Document'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            {isActive ? (
                                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                                    Active
                                </span>
                            ) : (
                                <span className="text-gray-400">Draft</span>
                            )}
                            <span className="text-gray-300">•</span>
                            {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Actions Dropdown Placeholder (could use Radix UI Dropdown) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content Preview */}
            <div
                onClick={() => onView(doc)}
                className="flex-1 mb-4 cursor-pointer"
            >
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 h-[80px] overflow-hidden relative">
                    <p className="text-xs text-gray-500 font-mono leading-relaxed line-clamp-3 opacity-80">
                        {doc.content || 'No content preview available.'}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
                </div>
            </div>

            {/* Intelligence & Stats */}
            <div className="space-y-3">
                {/* AI Chips */}
                {doc.aiAnalysis && (
                    <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                        <span className={`px-2 py-1 rounded-md border ${getToneColor(doc.aiAnalysis.tone)} capitalize`}>
                            {doc.aiAnalysis.tone || 'Neutral'}
                        </span>
                        {doc.aiAnalysis.personalization_score > 70 && (
                            <span className="px-2 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-100 flex items-center">
                                <Zap className="h-3 w-3 mr-1 fill-indigo-200" />
                                High Impact
                            </span>
                        )}
                    </div>
                )}

                {/* Linking Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Briefcase className="h-3.5 w-3.5" />
                        {doc.links && doc.links.length > 0 ? (
                            <span className="font-medium text-gray-700">
                                Used in {doc.links.length} application{doc.links.length !== 1 ? 's' : ''}
                            </span>
                        ) : (
                            <button onClick={() => onLink(doc)} className="text-indigo-600 hover:underline">
                                Link to job
                            </button>
                        )}
                    </div>

                    {/* Reuse Count */}
                    {doc.reuseCount && doc.reuseCount > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-gray-400" title="Times reused">
                            <TrendingUp className="h-3 w-3" />
                            {doc.reuseCount}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto rounded-xl">
                <button
                    onClick={() => onView(doc)}
                    className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                    View
                </button>
                <button
                    onClick={() => onLink(doc)}
                    className="px-4 py-2 bg-indigo-600 shadow-sm rounded-lg text-sm font-medium text-white hover:bg-indigo-700 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                    Link to Job
                </button>
            </div>
        </div>
    )
}
