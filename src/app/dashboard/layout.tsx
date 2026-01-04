import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNavigation from '@/components/DashboardNavigation'


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
            <DashboardNavigation userEmail={user.email} />

            <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-sm text-gray-500">
                            © {new Date().getFullYear()} CareerAI. Built with Next.js, Supabase & OpenAI.
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <Link href="/dashboard" className="text-gray-500 hover:text-indigo-600 transition">
                                Dashboard
                            </Link>
                            <Link href="/dashboard/resumes" className="text-gray-500 hover:text-indigo-600 transition">
                                Resumes
                            </Link>
                            <Link href="/dashboard/jobs" className="text-gray-500 hover:text-indigo-600 transition">
                                Jobs
                            </Link>
                            <Link href="/dashboard/settings" className="text-gray-500 hover:text-indigo-600 transition">
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
