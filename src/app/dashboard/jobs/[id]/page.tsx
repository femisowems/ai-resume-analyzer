import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateJobApplication } from '../actions'
import LinkedResumeSelector from './LinkedResumeSelector'
import GenerateDocButton from './GenerateDocButton'
import { JobTimeline } from '@/components/jobs/JobTimeline'
import { DocumentList } from '@/components/jobs/DocumentList'
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react'

export default async function JobOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    // parallel fetching
    const [jobResponse, timelineResponse, docsResponse, resumesResponse] = await Promise.all([
        supabase
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
            .single(),

        supabase
            .from('job_timeline_events')
            .select('*')
            .eq('job_id', id)
            .order('occurred_at', { ascending: false }),

        supabase
            .from('document_job_links')
            .select(`
                document:documents(*)
            `)
            .eq('job_application_id', id),

        supabase
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
    ])

    const job = jobResponse.data
    const events = timelineResponse.data || []
    // Flatten documents
    const documents = docsResponse.data?.map(link => link.document) || [] as any // Type cast needed due to join
    const resumes = resumesResponse.data

    if (!job) {
        notFound()
    }

    // Generate Signed URL for download (Legacy logic kept)
    let downloadUrl: string | null = null
    if (job.resume_version?.resume?.raw_file_path) {
        const { data } = await supabase
            .storage
            .from('resumes')
            .createSignedUrl(job.resume_version.resume.raw_file_path, 3600)
        if (data) {
            downloadUrl = data.signedUrl
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: 2/3 width */}
            <div className="lg:col-span-2 space-y-8">

                {/* AI Next Best Action Card */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Recommended Action</h3>
                            <p className="text-gray-600 mt-1">
                                based on your stage ({job.status}) and time elapsed.
                            </p>

                            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                {/* Placeholder Actions - Logic to be finalized in Phase 3 */}
                                {job.status === 'APPLIED' ? (
                                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                        Check Application Status <ArrowRight className="ml-2 w-4 h-4" />
                                    </button>
                                ) : (
                                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                        Prepare Follow-up <ArrowRight className="ml-2 w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>
                    <JobTimeline events={events} />
                </div>

                {/* Notes (Legacy form field) */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Notes</h3>
                    <form action={updateJobApplication}>
                        <input type="hidden" name="id" value={job.id} />
                        <textarea
                            name="notes"
                            rows={6}
                            defaultValue={job.notes || ''}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3"
                            placeholder="Jot down quick notes, salary details, or thoughts..."
                        />
                        <div className="mt-3 flex justify-end">
                            <button type="submit" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Save Notes</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sidebar: 1/3 width */}
            <div className="space-y-8">
                {/* Quick Actions / Status (Redundant with header but maybe useful for swift moves?) 
                    Keeping it minimal for now to avoid clutter. 
                 */}

                {/* Linked Assets */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Application Assets</h3>

                    <div className="mb-6">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Resume Version</label>
                        <LinkedResumeSelector
                            jobId={job.id}
                            resumes={resumes as any}
                            initialResumeId={job.resume_version?.resume?.id}
                            initialResumeTitle={job.resume_version?.resume?.title}
                            downloadUrl={downloadUrl}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</label>
                            <GenerateDocButton
                                jobId={job.id}
                                jobTitle={job.job_title}
                                companyName={job.company_name}
                                resumeTitle={job.resume_version?.resume?.title}
                            />
                        </div>
                        <DocumentList documents={documents} />
                    </div>
                </div>

                {/* Job Description (Read only view maybe?) */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Quick Stats</h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                            <dt className="text-xs font-medium text-gray-500">Days Open</dt>
                            <dd className="mt-1 text-lg font-semibold text-gray-900">
                                {Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 3600 * 24))}
                            </dd>
                        </div>
                        {job.match_score && (
                            <div className="px-4 py-2 bg-indigo-50 rounded-lg">
                                <dt className="text-xs font-medium text-gray-500">Match Score</dt>
                                <dd className="mt-1 text-lg font-semibold text-indigo-600">{job.match_score}%</dd>
                            </div>
                        )}
                    </dl>
                </div>

            </div>
        </div>
    )
}
