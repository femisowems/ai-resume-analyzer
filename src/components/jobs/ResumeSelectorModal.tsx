'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { fetchUserResumes } from '@/app/dashboard/jobs/actions-assets'
import { Loader2, FileText, ChevronRight, Check, AlertTriangle } from 'lucide-react'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface ResumeSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (versionId: string) => Promise<void>
    currentVersionId?: string
}

export function ResumeSelectorModal({
    isOpen,
    onClose,
    onSelect,
    currentVersionId
}: ResumeSelectorModalProps) {
    const [resumes, setResumes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            loadResumes()
        }
    }, [isOpen])

    async function loadResumes() {
        try {
            setIsLoading(true)
            const data = await fetchUserResumes()
            setResumes(data)

            // Auto-select resume that contains current version
            if (currentVersionId) {
                const resume = data.find((r: any) =>
                    r.versions.some((v: any) => v.id === currentVersionId)
                )
                if (resume) setSelectedResumeId(resume.id)
            } else if (data.length > 0) {
                setSelectedResumeId(data[0].id)
            }
        } catch (error) {
            console.error('Failed to load resumes:', error)
            toast.error('Failed to load resumes')
        } finally {
            setIsLoading(false)
        }
    }

    const handleConfirm = async (versionId: string) => {
        try {
            setIsSubmitting(true)
            await onSelect(versionId)
            onClose()
        } catch (error) {
            console.error('Select error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedResume = resumes.find(r => r.id === selectedResumeId)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Resume for this Job"
            maxWidth="lg"
        >
            <div className="flex flex-col md:flex-row h-[500px]">
                {/* Left Side: Resume List */}
                <div className="w-full md:w-1/2 border-r border-border overflow-y-auto bg-muted/30">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No resumes found. Please upload one first.
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {resumes.map((resume) => (
                                <button
                                    key={resume.id}
                                    onClick={() => setSelectedResumeId(resume.id)}
                                    className={cn(
                                        "w-full p-4 text-left flex items-start gap-3 transition-colors",
                                        selectedResumeId === resume.id
                                            ? 'bg-primary/5 ring-1 ring-inset ring-primary/20'
                                            : 'hover:bg-muted/50'
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        selectedResumeId === resume.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "font-medium truncate",
                                            selectedResumeId === resume.id ? 'text-primary' : 'text-foreground'
                                        )}>
                                            {resume.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {resume.versions?.length || 0} versions
                                        </p>
                                    </div>
                                    {selectedResumeId === resume.id && (
                                        <ChevronRight className="w-4 h-4 text-primary/60 mt-1" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Version List */}
                <div className="w-full md:w-1/2 flex flex-col overflow-hidden bg-background">
                    {!selectedResumeId ? (
                        <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground/50 italic">
                            Select a resume to see versions
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-border">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Versions</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {selectedResume?.versions?.sort((a: any, b: any) => b.version_number - a.version_number).map((version: any) => (
                                    <button
                                        key={version.id}
                                        onClick={() => handleConfirm(version.id)}
                                        disabled={isSubmitting || version.id === currentVersionId}
                                        className={cn(
                                            "w-full group p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all",
                                            version.id === currentVersionId
                                                ? 'border-primary/20 bg-primary/5 opacity-80 cursor-default'
                                                : 'border-transparent hover:border-primary/20 hover:bg-muted/30'
                                        )}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground">v{version.version_number}</span>
                                                {version.id === currentVersionId && (
                                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Currently Used</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(version.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {version.id === currentVersionId ? (
                                            <Check className="w-5 h-5 text-primary" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isSubmitting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Warning Footer */}
                            <div className="p-4 bg-amber-500/10 border-t border-amber-500/20">
                                <div className="flex gap-2 items-start">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <p className="text-[10px] text-amber-700 leading-relaxed">
                                        Changing the resume will mark dependent documents as <span className="font-semibold">outdated</span> and they may need to be regenerated.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    )
}

