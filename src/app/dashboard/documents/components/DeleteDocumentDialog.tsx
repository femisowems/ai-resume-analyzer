'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { DocumentItem } from '../actions'

interface DeleteDocumentDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    document: DocumentItem | null
}

export function DeleteDocumentDialog({ isOpen, onClose, onConfirm, document }: DeleteDocumentDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirm = async () => {
        if (!document) return
        setIsDeleting(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error('Delete failed', error)
            alert('Failed to delete document')
        } finally {
            setIsDeleting(false)
        }
    }

    if (!isOpen || !document) return null

    const linkedJobCount = document.links?.length || 0

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                Delete "{document.title || 'Untitled'}"?
                            </h3>
                            <div className="mt-2 text-sm text-gray-500">
                                <p className="mb-2">
                                    Are you sure you want to permanently delete this {document.type === 'resume' ? 'resume' : 'document'}?
                                    {document.type === 'resume' && ' This will also remove the file from storage.'}
                                </p>

                                {linkedJobCount > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3 text-left">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-amber-800">Linked to {linkedJobCount} job{linkedJobCount !== 1 ? 's' : ''}</h3>
                                                <div className="mt-1 text-xs text-amber-700">
                                                    <p>Deleting this document will remove it from all associated job applications.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete Document
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
