"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, FileText, User, File } from 'lucide-react'
import Logo from '@/components/Logo'

interface DashboardNavigationProps {
    userEmail?: string | null
}

export default function DashboardNavigation({ userEmail }: DashboardNavigationProps) {
    const pathname = usePathname()

    // Helper to determine if a link is active
    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(`${path}/`)
    }

    return (
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
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard/resumes')
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Resumes
                            </Link>
                            <Link
                                href="/dashboard/jobs"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard/jobs')
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Briefcase className="w-4 h-4 mr-2" />
                                Jobs
                            </Link>
                            <Link
                                href="/dashboard/documents"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard/documents')
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <File className="w-4 h-4 mr-2" />
                                Documents
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <Link href="/dashboard/settings" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition">
                            <User className="w-4 h-4 mr-2" />
                            {userEmail}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
