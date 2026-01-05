'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

const TYPES = [
    { id: 'resume', label: 'Resumes' },
    { id: 'cover_letter', label: 'Cover Letters' },
    { id: 'thank_you', label: 'Thank You Emails' },
    // { id: 'linkedin', label: 'LinkedIn' },
]

export function DocumentTypeChips() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentType = searchParams.get('type')

    const handleTypeSelect = (typeId: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (typeId) {
            params.set('type', typeId)
        } else {
            params.delete('type')
        }
        params.delete('page')
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
                Filter by:
            </span>

            <button
                onClick={() => handleTypeSelect(null)}
                className={`
                    whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                    ${!currentType
                        ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }
                `}
            >
                All Types
            </button>

            {TYPES.map((type) => (
                <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id === currentType ? null : type.id)}
                    className={`
                        whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5
                        ${currentType === type.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }
                    `}
                >
                    {type.label}
                    {currentType === type.id && <X className="h-3 w-3 opacity-60" />}
                </button>
            ))}
        </div>
    )
}
