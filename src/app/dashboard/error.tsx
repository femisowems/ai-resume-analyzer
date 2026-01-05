'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 max-w-md mb-8">
                We encountered an unexpected error while loading this page. This might be due to a temporary connectivity issue or an AI service timeout.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                    Refresh Page
                </button>
                <button
                    onClick={reset}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <pre className="mt-8 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-w-2xl w-full">
                    {error.message}
                    {error.stack}
                </pre>
            )}
        </div>
    )
}
