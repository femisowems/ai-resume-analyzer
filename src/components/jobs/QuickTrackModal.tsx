'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createJobApplication } from '@/app/dashboard/jobs/actions'
import { JobStatus } from '@/lib/types'

interface QuickTrackModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function QuickTrackModal({ isOpen, onClose }: QuickTrackModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            await createJobApplication(formData)
            onClose()
            // Optional: Show toast success
        } catch (error) {
            console.error(error)
            alert('Failed to save job')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Track Job</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                            type="text"
                            name="company_name"
                            id="company_name"
                            required
                            placeholder="e.g. Google"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">Role / Job Title</label>
                        <input
                            type="text"
                            name="job_title"
                            id="job_title"
                            required
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                        <select
                            name="status"
                            id="status"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                            defaultValue="APPLIED"
                        >
                            <option value="SAVED">Saved (Not Applied)</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interviewing</option>
                            <option value="OFFER">Offer</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Track Job'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
