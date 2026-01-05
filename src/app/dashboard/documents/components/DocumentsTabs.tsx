'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react'

export type TabType = 'all' | 'in-use' | 'needs-review'

const TABS = [
    { id: 'all', label: 'All Documents', icon: LayoutGrid, desc: 'Everything' },
    { id: 'in-use', label: 'In Use', icon: CheckCircle2, desc: 'Linked to active jobs' },
    { id: 'needs-review', label: 'Needs Review', icon: AlertCircle, desc: 'Requires attention' },
]

export function DocumentsTabs() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentTab = searchParams.get('tab') || 'all'

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('tab', tabId)
        params.delete('page') // Reset pagination if exists
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
            {TABS.map((tab) => {
                const isActive = currentTab === tab.id
                const Icon = tab.icon
                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${isActive
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }
                        `}
                    >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span>{tab.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
