'use client'

import { useState } from 'react'
import { Bold, Italic, List, AlignLeft, AlignCenter, Type, Save, X } from 'lucide-react'

interface DocumentEditorProps {
    initialContent: string
    onSave: (newContent: string) => Promise<void>
    onCancel: () => void
}

export function DocumentEditor({ initialContent, onSave, onCancel }: DocumentEditorProps) {
    const [content, setContent] = useState(initialContent)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave(content)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    // Basic toolbar logic would go here - for now it's just visual or simple appends
    // In a real TipTap implementation, these would drive the editor state.
    const insertFormat = (char: string) => {
        // Simple append for MVP placeholder - implementing full rich text is complex without a library
        // For a textarea, we could do basic cursor insertion if we had a ref
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50">
                <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded transition" title="Bold">
                    <Bold className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded transition" title="Italic">
                    <Italic className="h-4 w-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded transition" title="List">
                    <List className="h-4 w-4" />
                </button>
                <div className="flex-1" />
                <span className="text-xs text-gray-400 font-medium px-2">Markdown Supported</span>
            </div>

            {/* Editor Area */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 p-4 w-full resize-none focus:outline-none focus:ring-0 text-gray-800 font-mono text-sm leading-relaxed"
                placeholder="Start typing your document..."
                spellCheck={false}
            />

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </button>
            </div>
        </div>
    )
}
