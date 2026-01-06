'use client'

import { FileText, Download, Copy, Eye } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RecentDocuments({ docs }: { docs: any[] }) {
    if (!docs || docs.length === 0) return null

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {docs.map((doc) => (
                        <div key={doc.id} className="group flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <FileText size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-medium text-foreground truncate">{doc.title}</h3>
                                    <p className="text-[10px] text-muted-foreground capitalize truncate mt-0.5">{doc.type?.replace('_', ' ')} • {new Date(doc.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Copy Content">
                                    <Copy size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="View" asChild>
                                    <Link href={`/dashboard/documents`}>
                                        <Eye size={14} />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button variant="link" size="sm" className="w-full mt-2 text-muted-foreground hover:text-primary h-8 text-xs" asChild>
                    <Link href="/dashboard/documents">
                        View All Documents
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

