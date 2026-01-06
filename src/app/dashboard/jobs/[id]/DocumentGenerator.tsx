'use client'

import { useState, useTransition } from 'react'
import { FileText, Mail, Linkedin, Loader2, Copy, Check, X, AlertTriangle } from 'lucide-react'
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
    const [error, setError] = useState<string | null>(null)

    // Thank you email specific fields
    const [interviewerName, setInterviewerName] = useState('')
    const [interviewDate, setInterviewDate] = useState('')

    const handleGenerate = () => {
        setError(null)
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
            } catch (error: any) {
                console.error("Generation failed:", error)
                setError(error.message || 'Failed to generate document. Please try again.')
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
        <div className="fixed inset-0 z-50 overflow-hidden text-left">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="fixed inset-y-0 right-0 flex pl-10 pointer-events-none">
                <div className="w-screen max-w-2xl md:min-w-[40vw] md:max-w-[40vw] transform transition ease-in-out duration-500 bg-white shadow-2xl flex flex-col h-full pointer-events-auto border-l border-gray-100">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Generate Document</h2>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{jobTitle} @ {companyName}</p>
                            {resumeTitle && (
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    <FileText className="w-3 h-3 mr-1.5" />
                                    Using: {resumeTitle}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Tabs - Segmented Control Style */}
                    <div className="px-8 pt-6 pb-2">
                        <div className="flex bg-gray-100/80 p-1 rounded-lg">
                            <button
                                key="cover_letter"
                                onClick={() => {
                                    setActiveTab('cover_letter')
                                    setGeneratedContent('')
                                    setSaved(false)
                                    setError(null)
                                }}
                                className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'cover_letter'
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Cover Letter
                            </button>
                            <button
                                key="thank_you"
                                onClick={() => {
                                    setActiveTab('thank_you')
                                    setGeneratedContent('')
                                    setSaved(false)
                                    setError(null)
                                }}
                                className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'thank_you'
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Thank-You Email
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                        {!generatedContent ? (
                            <div className="space-y-6">
                                {activeTab === 'thank_you' && (
                                    <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Interviewer Name
                                            </label>
                                            <input
                                                type="text"
                                                value={interviewerName}
                                                onChange={(e) => setInterviewerName(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm placeholder:text-gray-400"
                                                placeholder="e.g. John Smith"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Interview Date
                                            </label>
                                            <input
                                                type="date"
                                                value={interviewDate}
                                                onChange={(e) => setInterviewDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm text-gray-600"
                                            />
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start text-red-700 animate-in fade-in slide-in-from-top-2">
                                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">Generation Failed</h4>
                                            <p className="text-sm mt-1 opacity-90">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-start">
                                        <div className="bg-indigo-100 p-2 rounded-lg mr-4 text-indigo-600">
                                            {activeTab === 'cover_letter' ? <FileText className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-indigo-900 mb-1">
                                                Ready to Generate
                                            </h4>
                                            <p className="text-sm text-indigo-700 leading-relaxed">
                                                {activeTab === 'cover_letter'
                                                    ? 'Our AI will analyze your resume and the job description to craft a compelling, personalized cover letter.'
                                                    : 'Fill in the details above and let AI draft a professional, polite thank-you email for your interviewer.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isPending || (activeTab === 'thank_you' && (!interviewerName || !interviewDate))}
                                    className="w-full relative group overflow-hidden flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed hover:-translate-y-0.5"
                                >
                                    <span className="relative z-10 flex items-center">
                                        {isPending ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                                Generating Magic...
                                            </>
                                        ) : (
                                            `Generate ${activeTab === 'cover_letter' ? 'Cover Letter' : 'Email'}`
                                        )}
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-inner overflow-auto h-full min-h-[400px]">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed max-w-none">
                                        {generatedContent}
                                    </pre>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        onClick={handleCopy}
                                        className="flex-1 flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                                <span className="text-green-700">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2 text-gray-500" />
                                                Copy Text
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isPending || saved}
                                        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-white transition shadow-sm ${saved
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                            } disabled:opacity-75`}
                                    >
                                        {saved ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Saved to Docs
                                            </>
                                        ) : (
                                            'Save Document'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setGeneratedContent('')}
                                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:text-indigo-600 transition shadow-sm"
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
