import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Briefcase, FileText, CheckCircle, Copy, Download } from 'lucide-react'
import { getDocument } from '../actions'
import { Metadata } from 'next'
import { DocumentDetailActions } from '../components/DocumentDetailActions'

export const metadata: Metadata = {
    title: 'View Document | CareerAI',
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function DocumentViewPage({ params }: PageProps) {
    const { id } = await params
    const document = await getDocument(id)

    if (!document) {
        notFound()
    }

    const isResume = document.type === 'resume'
    const mimeType = document.mimeType || (isResume ? 'application/pdf' : undefined)

    const isPdf = isResume && (mimeType === 'application/pdf')
    const isDocx = isResume && (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    const isLegacyDoc = isResume && (mimeType === 'application/msword')

    const company = document.companyName
    const jobTitle = document.jobTitle
    // If we have links, use the first one for the "Applied to" badge context
    const primaryLink = document.links && document.links.length > 0 ? document.links[0] : null

    // Derived or safe content for text docs
    const textContent = document.content || ''

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header / Navigation */}
            <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-4">
                    <Link
                        href="/dashboard/documents"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Documents
                    </Link>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {document.title}
                            </h1>
                            <span className={`
                                px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide
                                ${document.status === 'active'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'}
                            `}>
                                {document.status === 'active' ? 'Active' : 'Draft'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(document.createdAt).toLocaleDateString()}
                            </span>

                            {(company || jobTitle) && (
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-700">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    {jobTitle} {company ? `at ${company}` : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Toolbar */}
                <DocumentDetailActions document={document} />
            </div>

            {/* Document Viewer Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[800px] flex flex-col">
                {/* Viewer Header/Toolbar (Optional internal toolbar) */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <FileText className="h-4 w-4" />
                        {isPdf ? 'PDF Preview' : isDocx ? 'Document Preview' : 'Document Content'}
                    </div>
                    {!isResume && (
                        <div className="text-xs text-gray-400">
                            {textContent.length} characters
                        </div>
                    )}
                </div>

                {/* Viewer Content */}
                <div className="flex-1 bg-gray-50/50 p-6 md:p-8 flex justify-center">
                    {isPdf ? (
                        document.downloadUrl ? (
                            <iframe
                                src={`${document.downloadUrl}#toolbar=0&navpanes=0`}
                                className="w-full h-[800px] rounded-lg shadow-sm border border-gray-200 bg-white"
                                title="Resume PDF"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full w-full">
                                <div className="bg-gray-100 p-4 rounded-full mb-4">
                                    <FileText className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">PDF Unavailable</h3>
                                <p className="text-gray-500 max-w-sm mt-2">
                                    The storage file for this resume could not be found or the link has expired.
                                </p>
                            </div>
                        )
                    ) : isDocx ? (
                        document.previewHtml ? (
                            <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm border border-gray-200 p-12 md:p-16 min-h-[800px]">
                                <div
                                    className="prose prose-slate max-w-none font-sans whitespace-pre-wrap leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                                    dangerouslySetInnerHTML={{ __html: document.previewHtml }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full w-full bg-white rounded-lg border border-dashed border-gray-300">
                                <div className="bg-blue-50 p-4 rounded-full mb-4">
                                    <FileText className="h-10 w-10 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Preview Unavailable</h3>
                                <p className="text-gray-500 max-w-sm mt-2 mb-6">
                                    We couldn't generate a preview for this Word document.
                                </p>
                                {document.downloadUrl && (
                                    <a
                                        href={document.downloadUrl}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                        target="_blank" rel="noopener noreferrer"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download to View
                                    </a>
                                )}
                            </div>
                        )
                    ) : isLegacyDoc ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full w-full bg-white rounded-lg border border-dashed border-gray-300">
                            <div className="bg-amber-50 p-4 rounded-full mb-4">
                                <FileText className="h-10 w-10 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Preview Not Supported</h3>
                            <p className="text-gray-500 max-w-sm mt-2 mb-6">
                                Legacy Word documents (.doc) cannot be previewed in the browser.
                            </p>
                            {document.downloadUrl && (
                                <a
                                    href={document.downloadUrl}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    <Download className="h-4 w-4" />
                                    Download File
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm border border-gray-200 p-12 md:p-16 min-h-[800px]">
                            {/* Text Document Content */}
                            {/* We use whitespace-pre-wrap to preserve formatting from text areas */}
                            <div className="prose prose-slate max-w-none font-sans whitespace-pre-wrap leading-relaxed">
                                {textContent}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
