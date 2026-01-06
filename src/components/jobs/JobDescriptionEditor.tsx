'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, Save, X, Plus } from 'lucide-react'
import { updateJobDescription } from '@/app/dashboard/jobs/actions'

interface JobDescriptionEditorProps {
    jobId: string
    initialDescription?: string
}

export function JobDescriptionEditor({ jobId, initialDescription }: JobDescriptionEditorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [description, setDescription] = useState(initialDescription || '')
    const [isSaving, setIsSaving] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [isEditing, description])

    const handleSave = async () => {
        if (!description.trim()) return

        setIsSaving(true)
        try {
            await updateJobDescription(jobId, description)
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to save description:', error)
            alert('Failed to save changes. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setDescription(initialDescription || '')
        setIsEditing(false)
    }

    if (!initialDescription && !isEditing) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No job description</h3>
                <p className="mt-1 text-sm text-gray-500">Add the job description to unlock better AI analysis.</p>
                <div className="mt-6">
                    <button
                        onClick={() => setIsEditing(true)}
                        type="button"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Add Job Description
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Pencil className="h-4 w-4 mr-2 text-gray-500" />
                        Edit
                    </button>
                ) : (
                    <div className="flex space-x-3">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <textarea
                            ref={textareaRef}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[400px] p-4 font-mono text-sm leading-relaxed"
                            placeholder="Paste the full job description here..."
                        />
                        <p className="text-xs text-gray-500 text-right">
                            Paste from LinkedIn, Indeed, etc. We'll handle the formatting.
                        </p>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                        {description}
                    </div>
                )}
            </div>
        </div>
    )
}
