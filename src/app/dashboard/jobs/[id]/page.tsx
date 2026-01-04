import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Briefcase, Calendar, Clock } from 'lucide-react'
import { updateJobApplication, analyzeJobMatch, generateQuestions } from '../actions'
import LinkedResumeSelector from './LinkedResumeSelector'
import GenerateDocButton from './GenerateDocButton'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const resolvedParams = await params
    const { id } = resolvedParams

    const { data: job } = await supabase
        .from('job_applications')
        .select(`
            *,
            resume_version:resume_versions(
                id,
                version_number,
                resume:resumes(
                    id,
                    title,
                    raw_file_path
                )
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    const { data: resumes } = await supabase
        .from('resumes')
        .select(`
            id,
            title,
            current_version:resume_versions(
                version_number
            )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    // Fetch all job IDs to calculate Prev/Next
    const { data: allJobs } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const currentIndex = allJobs?.findIndex(j => j.id === id) ?? -1
    const nextJobId = currentIndex !== -1 && currentIndex < (allJobs?.length ?? 0) - 1 ? allJobs?.[currentIndex + 1].id : null
    const prevJobId = currentIndex > 0 ? allJobs?.[currentIndex - 1].id : null

    if (!job) {
        notFound()
    }

    // Generate Signed URL for download
    let downloadUrl: string | null = null
    if (job.resume_version?.resume?.raw_file_path) {
        const { data } = await supabase
            .storage
            .from('resumes')
            .createSignedUrl(job.resume_version.resume.raw_file_path, 3600) // 1 hour expiry

        if (data) {
            downloadUrl = data.signedUrl
        }
    }

    // Helper to format date
    const formatDate = (dateString: string | null) => {
        // ... (rest of helper) omitted for brevity in change, assume context matches
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <Link href="/dashboard/jobs" className="flex items-center text-sm text-gray-500 hover:text-indigo-600">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Jobs
                </Link>
                <div className="flex space-x-2">
                    {prevJobId && (
                        <Link href={`/dashboard/jobs/${prevJobId}`} className="flex items-center text-sm text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 px-3 py-1 rounded-md shadow-sm transition hover:bg-gray-50">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous Job
                        </Link>
                    )}
                    {nextJobId && (
                        <Link href={`/dashboard/jobs/${nextJobId}`} className="flex items-center text-sm text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 px-3 py-1 rounded-md shadow-sm transition hover:bg-gray-50">
                            Next Job
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{job.job_title}</h1>
                        <div className="flex items-center mt-2 text-gray-500 text-sm">
                            <Briefcase className="w-4 h-4 mr-1" />
                            <span className="font-medium mr-4">{job.company_name}</span>
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Applied: {formatDate(job.applied_date)}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                        ${job.status === 'offer' ? 'bg-green-100 text-green-800' :
                            job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                job.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                                    'bg-blue-100 text-blue-800'}`}>
                        {job.status}
                    </span>
                </div>

                <div className="p-6">
                    <form action={updateJobApplication} className="space-y-6">
                        <input type="hidden" name="id" value={job.id} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Update Status</label>
                                <select
                                    name="status"
                                    defaultValue={job.status}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                >
                                    <option value="applied">Applied</option>
                                    <option value="interview">Interviewing</option>
                                    <option value="offer">Offer Received</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Linked Resume</label>
                                <LinkedResumeSelector
                                    jobId={job.id}
                                    resumes={resumes as any}
                                    initialResumeId={job.resume_version?.resume?.id}
                                    initialResumeTitle={job.resume_version?.resume?.title}
                                    downloadUrl={downloadUrl}
                                />
                            </div>
                        </div>

                        {/* AI Document Generation */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                AI Documents 📄
                            </h3>
                            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between">
                                <div className="mb-4 sm:mb-0">
                                    <h4 className="font-medium text-indigo-900">Need a Cover Letter or Thank-You Note?</h4>
                                    <p className="text-sm text-indigo-700 mt-1">
                                        Generate personalized documents tailored to this specific job application.
                                    </p>
                                </div>
                                <GenerateDocButton
                                    jobId={job.id}
                                    jobTitle={job.job_title}
                                    companyName={job.company_name}
                                    resumeTitle={job.resume_version?.resume?.title}
                                />
                            </div>
                        </div>


                        {/* AI Match Analysis */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                Job Fit Analysis
                                {job.match_score && (
                                    <span className={`ml-3 px-3 py-1 text-sm rounded-full ${job.match_score >= 80 ? 'bg-green-100 text-green-800' :
                                        job.match_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        Match Score: {job.match_score}/100
                                    </span>
                                )}
                            </h3>

                            {!job.match_analysis ? (
                                <div className="bg-gray-50 rounded-lg p-6 text-center">
                                    <p className="text-gray-500 mb-4">
                                        Analyze how well your linked resume fits this job description.
                                    </p>
                                    <button
                                        formAction={async () => {
                                            'use server'
                                            await analyzeJobMatch(job.id)
                                        }}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition shadow-sm"
                                    >
                                        Analyze Match with AI
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white border rounded-md p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
                                        <p className="text-gray-600 text-sm">
                                            {(job.match_analysis as any).analysis}
                                        </p>
                                    </div>

                                    {(job.match_analysis as any).missing_keywords?.length > 0 && (
                                        <div className="bg-red-50 border border-red-100 rounded-md p-4">
                                            <h4 className="font-medium text-red-900 mb-2 text-sm">Missing Keywords / Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(job.match_analysis as any).missing_keywords.map((kw: string, i: number) => (
                                                    <span key={i} className="bg-white text-red-700 border border-red-200 px-2 py-1 rounded text-xs px-2">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button
                                            formAction={async () => {
                                                'use server'
                                                await analyzeJobMatch(job.id)
                                            }}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center bg-transparent"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                            </svg>
                                            Re-analyze Match
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes / Job Description used</label>
                            <textarea
                                name="notes"
                                rows={6}
                                defaultValue={job.notes || ''}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                placeholder="Paste the job description here or add your interview notes..."
                            />
                        </div>



                        {/* AI Interview Coach */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Interview Coach 🎤</h3>

                            {!job.interview_questions ? (
                                <div className="bg-purple-50 rounded-lg p-6 text-center border border-purple-100">
                                    <p className="text-purple-800 mb-4">
                                        Generate custom technical & behavioral questions for this role.
                                    </p>
                                    <button
                                        formAction={async () => {
                                            'use server'
                                            await generateQuestions(job.id)
                                        }}
                                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition shadow-sm"
                                    >
                                        Generate Interview Questions
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(job.interview_questions as any).map((q: any, i: number) => (
                                        <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${q.type === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {q.type}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-gray-900 mb-3">{q.question}</h4>

                                            <details className="group">
                                                <summary className="flex cursor-pointer items-center text-sm text-gray-500 hover:text-indigo-600">
                                                    <span>Show Suggested Answer</span>
                                                </summary>
                                                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded leading-relaxed border-l-2 border-indigo-200">
                                                    {q.answer}
                                                </p>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    )
}
