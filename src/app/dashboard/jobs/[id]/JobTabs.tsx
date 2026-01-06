'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, MessageSquare, FileText, Users } from 'lucide-react'

export default function JobTabs({ jobId }: { jobId: string }) {
    const pathname = usePathname()
    const baseUrl = `/dashboard/jobs/${jobId}`

    const tabs = [
        { name: 'Overview', href: baseUrl, icon: LayoutDashboard },
        { name: 'Job Description', href: `${baseUrl}/description`, icon: FileText },
        { name: 'Match Analysis', href: `${baseUrl}/match`, icon: Target },
        { name: 'Interview Prep', href: `${baseUrl}/interview`, icon: MessageSquare },
        { name: 'Contacts', href: `${baseUrl}/contacts`, icon: Users },
    ]

    return (
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <nav className="-mb-px flex space-x-6 sm:space-x-8 px-4 sm:px-0 min-w-max" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                                ${isActive
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <tab.icon className={`
                                -ml-0.5 mr-2 h-5 w-5
                                ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                            `} />
                            {tab.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
