import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ResumesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Resumes</h1>
                <Link
                    href="/dashboard/resumes/new"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Resume
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resumes?.map((resume) => (
                    <div key={resume.id} className="bg-white shadow rounded-lg p-6 border hover:border-indigo-500 transition">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{resume.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Uploaded: {new Date(resume.created_at).toLocaleDateString()}</p>
                        <div className="mt-4 flex gap-2">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                Version 1.0
                            </span>
                        </div>
                    </div>
                ))}

                {resumes?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No resumes found. Upload your first one!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
