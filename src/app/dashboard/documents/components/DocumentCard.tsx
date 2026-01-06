import { DocumentItem } from "../actions"
import { FileText, Mail, Linkedin, Trash2, Download, Zap, TrendingUp, Briefcase } from "lucide-react"
import { DocumentAnalysis } from "@/lib/types"
import { pdf } from '@react-pdf/renderer'
import { PdfDocumentView } from "@/components/documents/PdfDocumentView"
import { NeedsReviewReason } from "./NeedsReviewReason"
import { cn } from "@/lib/utils"

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
            case 'casual': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            default: return 'bg-secondary text-secondary-foreground border-border'
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'cover_letter': return <FileText className="h-5 w-5 text-primary" />
            case 'thank_you': return <Mail className="h-5 w-5 text-emerald-600" />
            case 'linkedin': return <Linkedin className="h-5 w-5 text-blue-600" />
            case 'resume': return <FileText className="h-5 w-5 text-fuchsia-600" />
            default: return <FileText className="h-5 w-5 text-muted-foreground" />
        }
    }

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const blob = await pdf(
                <PdfDocumentView
                    title={doc.title || ''}
                    content={doc.content || ''}
                    jobTitle={doc.jobTitle || ''}
                    companyName={doc.companyName || ''}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${doc.title || 'document'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download PDF', error);
            alert('Failed to generate PDF');
        }
    }

    return (
        <div className="group relative bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col h-full animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border group-hover:bg-card group-hover:border-primary/20 transition-colors">
                        {getIcon(doc.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1" title={doc.title}>
                            {doc.title || 'Untitled Document'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            {isActive ? (
                                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                                    Active
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Draft</span>
                            )}
                            <span className="text-muted-foreground/50">•</span>
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity z-20 relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(doc.id, doc.type)
                        }}
                        className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete Document"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Needs Review Override */}
            {doc.needsReviewReasons && doc.needsReviewReasons.length > 0 && (
                <div className="mb-3">
                    <NeedsReviewReason reasons={doc.needsReviewReasons} />
                </div>
            )}

            {/* Content Preview */}
            <div
                onClick={() => onView(doc)}
                className="flex-1 mb-4 cursor-pointer"
            >
                <div className="p-3 bg-muted/30 rounded-lg border border-border h-[80px] overflow-hidden relative">
                    <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3 opacity-80">
                        {doc.content || 'No content preview available.'}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted/30 to-transparent" />
                </div>
            </div>

            {/* Intelligence & Stats */}
            <div className="space-y-3">
                {/* AI Chips */}
                {doc.aiAnalysis && (
                    <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                        <span className={cn("px-2 py-1 rounded-md border capitalize", getToneColor(doc.aiAnalysis.tone))}>
                            {doc.aiAnalysis.tone || 'Neutral'}
                        </span>
                        {doc.aiAnalysis.personalization_score > 70 && (
                            <span className="px-2 py-1 rounded-md border bg-primary/10 text-primary border-primary/20 flex items-center">
                                <Zap className="h-3 w-3 mr-1 fill-primary/20" />
                                High Impact
                            </span>
                        )}
                    </div>
                )}

                {/* Linking Info */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        {doc.links && doc.links.length > 0 ? (
                            <span className="font-medium text-foreground">
                                Used in {doc.links.length} application{doc.links.length !== 1 ? 's' : ''}
                            </span>
                        ) : (
                            <button onClick={() => onLink(doc)} className="text-primary hover:underline">
                                Link to job
                            </button>
                        )}
                    </div>

                    {/* Reuse Count */}
                    {doc.reuseCount && doc.reuseCount > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Times reused">
                            <TrendingUp className="h-3 w-3" />
                            {doc.reuseCount}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-card/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto rounded-xl">
                <button
                    onClick={() => onView(doc)}
                    className="px-4 py-2 bg-background border border-border shadow-sm rounded-lg text-sm font-medium text-foreground hover:text-primary hover:border-primary/30 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                    View
                </button>
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-background border border-border shadow-sm rounded-lg text-sm font-medium text-foreground hover:text-primary hover:border-primary/30 hover:shadow-md transition-all transform hover:-translate-y-0.5 flex items-center"
                    title="Download PDF"
                >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                </button>
                <button
                    onClick={() => onLink(doc)}
                    className="px-4 py-2 bg-primary shadow-sm rounded-lg text-sm font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                    Link to Job
                </button>
            </div>
        </div>
    )
}

