import { Lightbulb, TrendingUp, AlertTriangle, FileText, ArrowRight } from "lucide-react"
import { DocumentItem } from "../actions"

interface IntelligenceSidebarProps {
    documents: DocumentItem[]
}

export function IntelligenceSidebar({ documents }: IntelligenceSidebarProps) {
    const activeDocs = documents.filter(d => d.status === 'active' || (d.links && d.links.length > 0))
    const totalReuse = documents.reduce((acc, d) => acc + (d.reuseCount || 0), 0)

    // Simple heuristic for "Needs Improvement"
    const lowScoreDocs = documents.filter(d => d.aiAnalysis && d.aiAnalysis.personalization_score < 50)

    return (
        <div className="w-80 border-l border-gray-200 bg-gray-50/50 p-6 hidden xl:block min-h-screen">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Intelligence Rail
            </h3>

            <div className="space-y-6">
                {/* Stat Box */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Total Reuse</span>
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{totalReuse} <span className="text-sm font-normal text-gray-400">times</span></div>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                        Your documents are working hard for you.
                    </p>
                </div>

                {/* Insights Section */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Opportunities</h4>
                    <div className="space-y-3">
                        {lowScoreDocs.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-amber-800">
                                            {lowScoreDocs.length} documents need personalization.
                                        </p>
                                        <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">
                                            Improving these could increase response rates by 20%.
                                        </p>
                                        <button className="text-[10px] font-bold text-amber-700 mt-2 hover:underline flex items-center">
                                            Review Docs <ArrowRight className="h-3 w-3 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-indigo-800">
                                        Create a reusable template?
                                    </p>
                                    <p className="text-[10px] text-indigo-600 mt-1 leading-relaxed">
                                        Your "Senior Frontend" resume performs well. Save it as a template.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Pipeline Snippet */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Pipeline</h4>
                    <ul className="space-y-2">
                        {activeDocs.slice(0, 5).map(doc => (
                            <li key={doc.id} className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${doc.type === 'resume' ? 'bg-fuchsia-500' : 'bg-indigo-500'}`} />
                                <span className="text-xs text-gray-600 truncate flex-1">{doc.title}</span>
                                {doc.links[0]?.status && (
                                    <span className="text-[10px] text-gray-400 border px-1 rounded bg-white">
                                        {doc.links[0].status}
                                    </span>
                                )}
                            </li>
                        ))}
                        {activeDocs.length === 0 && (
                            <li className="text-xs text-gray-400 italic">No active documents linked to jobs.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
