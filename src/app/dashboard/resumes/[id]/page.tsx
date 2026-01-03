import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, Clock } from 'lucide-react'

export default async function ResumeDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: resume } = await supabase
        .from('resumes')
        .select(`
      *,
      current_version:resume_versions!resumes_current_version_id_fkey(*)
    `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!resume) {
        notFound()
    }

    // Type assertions for now since supabase types aren't generated yet
    const content = (resume.current_version as any)?.content || {}
    const rawText = content.raw_text || 'No text parsed.'

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
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100">
                            Analyze with AI
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-gray-200">
                    {/* Sidebar / Stats */}
                    <div className="p-6 bg-gray-50">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                        </h3>
                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-gray-500">Version</dt>
                                <dd className="font-medium">{(resume.current_version as any)?.version_number || 1}.0</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Skills Detected</dt>
                                <dd className="text-gray-900 mt-1">-</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Content */}
                    <div className="col-span-2 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Parsed Content</h3>
                        <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md border text-gray-700 whitespace-pre-wrap font-mono text-xs overflow-auto max-h-[600px]">
                            {rawText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
