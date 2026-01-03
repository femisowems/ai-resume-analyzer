import Link from 'next/link'
import { Briefcase, FileText, User } from 'lucide-react'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Logo />
                            </div>
                            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href="/dashboard/resumes"
                                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Resumes
                                </Link>
                                <Link
                                    href="/dashboard/jobs"
                                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Jobs
                                </Link>
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <Link href="/dashboard/settings" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition">
                                <User className="w-4 h-4 mr-2" />
                                {user.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

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
