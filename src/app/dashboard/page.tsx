import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <a
                    href="/dashboard/resumes/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    Upload New Resume
                </a>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-700 mb-6">Welcome, {user.email}</p>

                <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">My Resumes</h2>

                    {!resumes || resumes.length === 0 ? (
                        <p className="text-gray-500 italic">No resumes uploaded yet.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {resumes.map((resume: any) => (
                                <a
                                    key={resume.id}
                                    href={`/dashboard/resumes/${resume.id}`}
                                    className="block p-4 border rounded hover:border-indigo-500 hover:shadow-md transition"
                                >
                                    <h3 className="font-medium text-gray-900 truncate">{resume.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                                    </p>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
