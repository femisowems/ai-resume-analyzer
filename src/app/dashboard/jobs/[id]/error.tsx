'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Job Detail Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong!</h2>
            <p className="text-sm text-gray-500 max-w-md mb-6">
                We couldn't load the job details. This might be a temporary connection issue or a missing resource.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.location.href = '/dashboard/jobs'}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Back to Jobs
                </button>
                <button
                    onClick={() => reset()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-100 rounded text-left overflow-auto max-w-lg w-full text-xs font-mono text-red-800">
                    {error.message}
                    {error.stack && <pre className="mt-2">{error.stack}</pre>}
                </div>
            )}
        </div>
    )
}
