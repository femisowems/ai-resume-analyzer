import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createJobApplication } from '../actions'

export default async function NewJobPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Fetch resumes to allow linking
    const { data: resumes } = await supabase
        .from('resumes')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/dashboard/jobs" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Jobs
            </Link>

            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-xl font-bold mb-6">Track New Application</h1>

                <form action={createJobApplication} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input name="company_name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        <input name="job_title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option value="applied">Applied</option>
                            <option value="interview">Interviewing</option>
                            <option value="offer">Offer Received</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resume Used</label>
                        <select name="resume_id" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option value="">-- Select a Resume --</option>
                            {resumes?.map(r => (
                                <option key={r.id} value={r.id}>{r.title} ({new Date(r.created_at).toLocaleDateString()})</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Optional: Link the specific resume you sent.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Description / Notes</label>
                        <textarea name="notes" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"></textarea>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Save Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
