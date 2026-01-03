'use client'

import { useState } from 'react'
import { Pencil, Check, X, Download } from 'lucide-react'
import { updateJobApplication } from '../actions'

type Resume = {
    id: string
    title: string
    current_version?: { version_number: number }[] | { version_number: number } | null
}

interface LinkedResumeSelectorProps {
    jobId: string
    initialResumeId: string | undefined
    initialResumeTitle: string | undefined
    resumes: Resume[]
    downloadUrl?: string | null
}

export default function LinkedResumeSelector({
    jobId,
    initialResumeId,
    initialResumeTitle,
    resumes,
    downloadUrl
}: LinkedResumeSelectorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId || '')
    const [isSaving, setIsSaving] = useState(false)

    // Handle standard form submission via Server Action
    const handleSave = async () => {
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append('id', jobId)
            formData.append('resume_id', selectedResumeId)

            // We need to call the server action manually since we are not in a form
            await updateJobApplication(formData)
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update resume:', error)
            alert('Failed to update linked resume')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isEditing) {
        return (
            <div className="mt-1 flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center overflow-hidden">
                    {downloadUrl ? (
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center truncate"
                            title="Download Resume"
                        >
                            <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                            {initialResumeTitle || 'Download Resume'}
                        </a>
                    ) : (
                        <span className="text-sm text-gray-500 italic">No resume linked</span>
                    )}
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
                    title="Change Linked Resume"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="mt-1 flex items-center space-x-2">
            <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                disabled={isSaving}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            >
                <option value="">Select a resume...</option>
                {resumes.map((resume) => {
                    // Handle array or object for joined data
                    const version = Array.isArray(resume.current_version)
                        ? resume.current_version[0]
                        : resume.current_version;

                    return (
                        <option key={resume.id} value={resume.id}>
                            {resume.title} {version ? `(v${version.version_number})` : ''}
                        </option>
                    )
                })}
            </select>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition disabled:opacity-50"
                title="Save"
            >
                <Check className="w-4 h-4" />
            </button>
            <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition disabled:opacity-50"
                title="Cancel"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
