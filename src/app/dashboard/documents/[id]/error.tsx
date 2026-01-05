'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load document</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                We couldn't find the document you're looking for, or you don't have permission to access it.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/dashboard/documents"
                    className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Documents
                </Link>
                <button
                    onClick={reset}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
