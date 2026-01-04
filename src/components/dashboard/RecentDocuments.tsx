'use client'

import { FileText, Download, Copy, Eye } from 'lucide-react'
import Link from 'next/link'

export default function RecentDocuments({ docs }: { docs: any[] }) {
    if (!docs || docs.length === 0) return null

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Access</h2>
            <div className="space-y-3">
                {docs.map((doc) => (
                    <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</h3>
                                <p className="text-xs text-gray-500 capitalize">{doc.type?.replace('_', ' ')} • {new Date(doc.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Copy Content">
                                <Copy size={16} />
                            </button>
                            <Link href={`/dashboard/documents`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View">
                                <Eye size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <Link href="/dashboard/documents" className="block mt-4 text-center text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                View All Documents
            </Link>
        </div>
    )
}
