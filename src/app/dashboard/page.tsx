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

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-700">Welcome, {user.email}</p>
                <p className="text-sm text-gray-500 mt-2">User ID: {user.id}</p>

                <div className="mt-6 border-t pt-6">
                    <h2 className="text-lg font-semibold mb-2">My Resumes</h2>
                    <p className="text-gray-500 italic">No resumes uploaded yet.</p>
                </div>
            </div>
        </div>
    )
}
