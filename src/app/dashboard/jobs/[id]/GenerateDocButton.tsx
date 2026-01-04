'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import DocumentGenerator from './DocumentGenerator'

interface GenerateDocButtonProps {
    jobId: string
    jobTitle: string
    companyName: string
}

export default function GenerateDocButton({ jobId, jobTitle, companyName }: GenerateDocButtonProps) {
    const [showModal, setShowModal] = useState(false)

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition text-sm font-medium"
            >
                <FileText className="h-4 w-4 mr-2" />
                Generate Document
            </button>

            {showModal && (
                <DocumentGenerator
                    jobId={jobId}
                    jobTitle={jobTitle}
                    companyName={companyName}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    )
}
