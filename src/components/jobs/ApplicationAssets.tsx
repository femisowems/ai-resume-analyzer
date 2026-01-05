'use client'

import { ApplicationAssetsData, ContextAction, DocumentType } from '@/lib/types'
import { ResumeAnchor } from './ResumeAnchor'
import { RequiredDocuments } from './RequiredDocuments'
import { PostInterviewDocuments } from './PostInterviewDocuments'
import { ContextActions } from './ContextActions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { regenerateJobDocument, generateJobDocument } from '@/app/dashboard/jobs/actions-assets'
import { toast } from 'sonner'

interface ApplicationAssetsProps {
    jobId: string
    jobStage: string
    assetsData: ApplicationAssetsData
}

export function ApplicationAssets({ jobId, jobStage, assetsData }: ApplicationAssetsProps) {
    const router = useRouter()
    const [isGenerating, setIsGenerating] = useState(false)

    const handleChangeResume = () => {
        // TODO: Open resume selector modal
        toast.info('Resume selector coming soon')
    }

    const handleOptimizeResume = () => {
        // Navigate to resume editor with job context
        if (assetsData.resume_used?.resume_version?.resume?.id) {
            router.push(`/dashboard/resumes/${assetsData.resume_used.resume_version.resume.id}?jobId=${jobId}`)
        } else {
            toast.error('No resume linked to this job')
        }
    }

    const handleRegenerate = async (jobDocumentId: string) => {
        try {
            toast.loading('Regenerating document...', { id: 'regenerate' })
            const result = await regenerateJobDocument(jobDocumentId)
            if (result.success) {
                toast.success('Document regenerated successfully', { id: 'regenerate' })
                router.refresh()
            }
        } catch (error) {
            console.error('Regenerate error:', error)
            toast.error('Failed to regenerate document', { id: 'regenerate' })
        }
    }

    const handleGenerate = async (documentType: DocumentType) => {
        try {
            setIsGenerating(true)
            toast.loading(`Generating ${documentType.replace('_', ' ')}...`, { id: 'generate' })
            const result = await generateJobDocument(jobId, documentType)
            if (result.success) {
                toast.success('Document generated successfully', { id: 'generate' })
                router.refresh()
            }
        } catch (error) {
            console.error('Generate error:', error)
            toast.error('Failed to generate document', { id: 'generate' })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleViewDocument = (documentId: string) => {
        // TODO: Open document viewer modal
        router.push(`/dashboard/documents?highlight=${documentId}`)
    }

    const handleActionClick = (action: ContextAction) => {
        switch (action.type) {
            case 'generate':
                if (action.document_type) {
                    handleGenerate(action.document_type)
                }
                break
            case 'regenerate':
                // Find the document and regenerate
                toast.info('Regenerate action coming soon')
                break
            case 'optimize':
                handleOptimizeResume()
                break
            case 'review':
                toast.info('Review action coming soon')
                break
        }
    }

    return (
        <div className="space-y-6">
            {/* Resume Used - Fixed Context Anchor */}
            <ResumeAnchor
                resumeAsset={assetsData.resume_used}
                onChangeResume={handleChangeResume}
                onOptimizeResume={handleOptimizeResume}
            />

            {/* Required Documents */}
            <RequiredDocuments
                documents={assetsData.required_documents}
                onRegenerate={handleRegenerate}
                onView={handleViewDocument}
                onGenerate={handleGenerate}
            />

            {/* Post-Interview Documents */}
            {assetsData.optional_documents.length > 0 && (
                <PostInterviewDocuments
                    documents={assetsData.optional_documents}
                    jobStage={jobStage as any}
                    onGenerate={handleGenerate}
                    onRegenerate={handleRegenerate}
                    onView={handleViewDocument}
                />
            )}

            {/* Context-Aware Actions */}
            <ContextActions
                actions={assetsData.next_actions}
                onActionClick={handleActionClick}
            />
        </div>
    )
}
