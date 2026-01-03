'use client'

import { uploadResume } from '../actions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useRouter } from 'next/navigation'

export default function UploadResumeForm() {
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsUploading(true)
        try {
            const result = await uploadResume(formData)
            if (result && result.success) {
                router.push('/dashboard/resumes')
            }
        } catch (error) {
            console.error(error)
            alert('Failed to upload resume')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-xl font-semibold mb-6">Upload New Resume</h2>
            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resume Title</label>
                    <input
                        name="title"
                        type="text"
                        placeholder="e.g. Frontend Developer 2024"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Resume File (PDF/DOCX)</label>
                    <input
                        name="resume"
                        type="file"
                        accept=".pdf,.docx,.doc"
                        required
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isUploading}
                    className="flex w-full justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Uploading...
                        </>
                    ) : (
                        'Upload & Analyze'
                    )}
                </button>
            </form>
        </div>
    )
}
