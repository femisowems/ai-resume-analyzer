'use client'

import { useState, useTransition } from 'react'
import { FileText, Mail, Linkedin, Loader2, Copy, Check, X } from 'lucide-react'
import { generateCoverLetterAction, generateThankYouAction, createDocument } from '../../documents/actions'

interface DocumentGeneratorProps {
    jobId: string
    jobTitle: string
    companyName: string
    resumeTitle?: string
    initialTab?: 'cover_letter' | 'thank_you'
    onClose: () => void
}

export default function DocumentGenerator({ jobId, jobTitle, companyName, resumeTitle, initialTab = 'cover_letter', onClose }: DocumentGeneratorProps) {
    const [activeTab, setActiveTab] = useState<'cover_letter' | 'thank_you'>(initialTab)
    const [isPending, startTransition] = useTransition()
    const [generatedContent, setGeneratedContent] = useState<string>('')
    const [copied, setCopied] = useState(false)
    const [saved, setSaved] = useState(false)

    // Thank you email specific fields
    const [interviewerName, setInterviewerName] = useState('')
    const [interviewDate, setInterviewDate] = useState('')

    const handleGenerate = () => {
        startTransition(async () => {
            try {
                let content = ''
                if (activeTab === 'cover_letter') {
                    content = await generateCoverLetterAction(jobId)
                } else {
                    content = await generateThankYouAction(jobId, interviewerName, interviewDate)
                }
                setGeneratedContent(content)
                setSaved(false)
            } catch (error) {
                alert('Failed to generate document. Please try again.')
            }
        })
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = () => {
        startTransition(async () => {
            try {
                await createDocument(activeTab, generatedContent, jobId)
                setSaved(true)
            } catch (error: any) {
                alert(`Failed to save document: ${error.message}`)
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
                <div className="w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl flex flex-col h-full pointer-events-auto">
                    {/* Header */}
                    <div className="px-6 py-6 border-b flex justify-between items-start bg-gray-50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Generate Document</h2>
                            <p className="text-sm text-gray-600 mt-1">{jobTitle} at {companyName}</p>
                            {resumeTitle && (
                                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Using: {resumeTitle}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b px-6">
                        <button
                            onClick={() => {
                                setActiveTab('cover_letter')
                                setGeneratedContent('')
                                setSaved(false)
                            }}
                            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'cover_letter'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Cover Letter
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('thank_you')
                                setGeneratedContent('')
                                setSaved(false)
                            }}
                            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'thank_you'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Thank-You Email
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {!generatedContent ? (
                            <div className="space-y-4">
                                {activeTab === 'thank_you' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Interviewer Name
                                            </label>
                                            <input
                                                type="text"
                                                value={interviewerName}
                                                onChange={(e) => setInterviewerName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="John Smith"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Interview Date
                                            </label>
                                            <input
                                                type="date"
                                                value={interviewDate}
                                                onChange={(e) => setInterviewDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                    <p className="text-sm text-indigo-900">
                                        {activeTab === 'cover_letter'
                                            ? 'Click "Generate" to create a personalized cover letter based on your resume and this job description.'
                                            : 'Fill in the details above and click "Generate" to create a professional thank-you email.'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isPending || (activeTab === 'thank_you' && (!interviewerName || !interviewDate))}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                                        {generatedContent}
                                    </pre>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCopy}
                                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy to Clipboard
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isPending || saved}
                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        {saved ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Saved!
                                            </>
                                        ) : (
                                            'Save Document'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setGeneratedContent('')}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
