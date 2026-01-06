'use client'

import { FileText, Download, Copy, Eye } from 'lucide-react'
import Link from 'next/link'

export default function RecentDocuments({ docs }: { docs: any[] }) {
    if (!docs || docs.length === 0) return null

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Quick Access</h2>
            <div className="space-y-3">
                {docs.map((doc) => (
                    <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-medium text-card-foreground truncate">{doc.title}</h3>
                                <p className="text-xs text-muted-foreground capitalize">{doc.type?.replace('_', ' ')} • {new Date(doc.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Copy Content">
                                <Copy size={16} />
                            </button>
                            <Link href={`/dashboard/documents`} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="View">
                                <Eye size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <Link href="/dashboard/documents" className="block mt-4 text-center text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
                View All Documents
            </Link>
        </div>
    )
}
