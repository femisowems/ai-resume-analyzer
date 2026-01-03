import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, Clock } from 'lucide-react'

export default async function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const resolvedParams = await params
    const { id } = resolvedParams

    // 1. Fetch Resume Metadata
    const { data: resume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!resume) {
        notFound()
    }

    // 2. Fetch Current Version (if exists)
    let currentVersion = null
    if (resume.current_version_id) {
        const { data: version } = await supabase
            .from('resume_versions')
            .select('*')
            .eq('id', resume.current_version_id)
            .single()
        currentVersion = version
    }

    const content = (currentVersion?.content as any) || {}
    const rawText = content.raw_text || 'No text parsed.'
    const summary = content.summary || ''

    const analysis = (currentVersion?.analysis_result as any) || {}
    const score = analysis.score
    const improvements = analysis.improvements || []

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
            </Link>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Uploaded {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-gray-200">
                    {/* Sidebar / Stats */}
                    <div className="p-6 bg-gray-50">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            File Details
                        </h3>
                        <dl className="space-y-4 text-sm">
                            {typeof score === 'number' && (
                                <div>
                                    <dt className="text-gray-500">AI Score</dt>
                                    <dd className="font-bold text-2xl text-indigo-600">{score}/100</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-gray-500">Path</dt>
                                <dd className="font-medium text-xs break-all">{resume.raw_file_path}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Version</dt>
                                <dd className="font-medium">{currentVersion?.version_number || 1}.0</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Content */}
                    <div className="col-span-2 p-6">
                        {improvements.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested Improvements</h3>
                                <ul className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-2">
                                    {improvements.map((imp: string, i: number) => (
                                        <li key={i} className="text-sm text-amber-900 flex items-start">
                                            <span className="mr-2 text-amber-500">•</span>
                                            {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {summary && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Summary</h3>
                                <p className="text-gray-800 bg-gray-50 p-3 rounded border text-sm leading-relaxed">{summary}</p>
                            </div>
                        )}

                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Raw Text Extraction</h3>
                        <div className="prose prose-sm max-w-none bg-slate-900 p-4 rounded-md border border-slate-700 text-slate-300 font-mono text-xs overflow-auto max-h-[500px] whitespace-pre-wrap">
                            {rawText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
