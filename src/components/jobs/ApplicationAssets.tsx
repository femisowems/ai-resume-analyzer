'use client'

import type { ApplicationAssetsData, ContextAction, DocumentType, JobDocument } from '@/lib/types'
import { ResumeAnchor } from './ResumeAnchor'
import { RequiredDocuments } from './RequiredDocuments'
import { PostInterviewDocuments } from './PostInterviewDocuments'
import { ContextActions } from './ContextActions'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { regenerateJobDocument, generateJobDocument, changeJobResume, fetchSuggestedActions } from '@/app/dashboard/jobs/actions-assets'
import { toast } from '@/lib/toast'
import { ResumeSelectorModal } from './ResumeSelectorModal'
import { DocumentViewerModal } from './DocumentViewerModal'

interface ApplicationAssetsProps {
    jobId: string
    jobStage: string
    assetsData: ApplicationAssetsData
}

export function ApplicationAssets({ jobId, jobStage, assetsData }: ApplicationAssetsProps) {
    const router = useRouter()
    const [isGenerating, setIsGenerating] = useState(false)
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
    const [viewingDocument, setViewingDocument] = useState<JobDocument | null>(null)

    // Client-side AI Actions Fetching
    const [nextActions, setNextActions] = useState<ContextAction[]>(assetsData.next_actions || [])
    const [isLoadingActions, setIsLoadingActions] = useState(true)

    useEffect(() => {
        let isMounted = true;
        async function loadActions() {
            try {
                const actions = await fetchSuggestedActions(jobId)
                if (isMounted) {
                    setNextActions(actions)
                }
            } catch (error) {
                console.error("Failed to load suggestions", error)
            } finally {
                if (isMounted) setIsLoadingActions(false)
            }
        }
        loadActions()
        return () => { isMounted = false }
    }, [jobId])

    useEffect(() => {
        console.log('[EVIDENCE] ApplicationAssets props updated:', assetsData.required_documents.map(d => ({
            id: d.id,
            docId: d.document_id,
            contentSnippet: (d as any).document?.content?.substring(0, 30)
        })))
    }, [assetsData])

    const handleChangeResume = () => {
        setIsResumeModalOpen(true)
    }

    const handleSelectResume = async (versionId: string) => {
        try {
            toast.loading('Updating resume and syncing documents...', { id: 'change-resume' })
            const result = await changeJobResume(jobId, versionId)

            if (result.success) {
                toast.success(result.summary, { id: 'change-resume' })
                router.refresh()
            }
        } catch (error) {
            console.error('Change resume error:', error)
            toast.error('Failed to update resume', { id: 'change-resume' })
        }
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

    const handleViewDocument = (jobDocumentId: string) => {
        // Find document in assetsData
        const doc = [...assetsData.required_documents, ...assetsData.optional_documents]
            .find(d => d.id === jobDocumentId)

        if (doc?.document_id) {
            setViewingDocument(doc)
        } else {
            toast.error('Document content not found')
        }
    }

    const handleActionClick = (action: ContextAction) => {
        switch (action.type) {
            case 'generate':
                if (action.document_type) {
                    handleGenerate(action.document_type)
                }
                break
            case 'regenerate':
                // Find corresponding job document and regenerate
                const docToRegen = [...assetsData.required_documents, ...assetsData.optional_documents]
                    .find(d => d.document_type === action.document_type)
                if (docToRegen) {
                    handleRegenerate(docToRegen.id)
                }
                break
            case 'optimize':
                handleOptimizeResume()
                break
            case 'review':
                // Find corresponding job document and view
                const docToReview = [...assetsData.required_documents, ...assetsData.optional_documents]
                    .find(d => d.document_type === action.document_type)
                if (docToReview) {
                    handleViewDocument(docToReview.id)
                }
                break
        }
    }

    // Calculate overall status based on document health
    const documents = [...assetsData.required_documents, ...assetsData.optional_documents]
    const hasIssues = documents.some(d => d.status === 'needs_update' || d.status === 'missing')
    const resumeStatus = hasIssues ? 'needs_update' : 'ready'

    return (
        <div className="space-y-6">
            {/* Resume Used - Fixed Context Anchor */}
            <ResumeAnchor
                resumeAsset={assetsData.resume_used}
                status={resumeStatus}
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
                actions={nextActions}
                onActionClick={handleActionClick}
                isLoading={isLoadingActions}
            />

            {/* Modals */}
            <ResumeSelectorModal
                isOpen={isResumeModalOpen}
                onClose={() => setIsResumeModalOpen(false)}
                onSelect={handleSelectResume}
                currentVersionId={assetsData.resume_used?.resume_version?.id}
            />

            <DocumentViewerModal
                isOpen={!!viewingDocument}
                onClose={() => setViewingDocument(null)}
                document={viewingDocument}
            />
        </div>
    )
}
