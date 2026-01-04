import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, Clock } from 'lucide-react'
import ImprovementPanel from '../components/ImprovementPanel'

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
            <Link href="/dashboard/resumes" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Resumes
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
                                    <dd className={`font-bold text-2xl ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {score}/100
                                    </dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-gray-500">Path</dt>
                                <dd className="font-medium text-xs break-all text-gray-600">{resume.raw_file_path}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Version</dt>
                                <dd className="font-medium">{currentVersion?.version_number || 1}.0</dd>
                            </div>
                        </dl>

                        {analysis.strengths && analysis.strengths.length > 0 && (
                            <div className="mt-8">
                                <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Top Strengths</h4>
                                <ul className="space-y-2">
                                    {analysis.strengths.slice(0, 3).map((str: string, i: number) => (
                                        <li key={i} className="text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded border border-green-100">
                                            ✓ {str}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="col-span-2 p-6">
                        <ImprovementPanel resumeId={resume.id} improvements={improvements} />

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
