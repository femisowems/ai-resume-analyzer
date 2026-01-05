import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updateJobApplication } from '../actions'
import LinkedResumeSelector from './LinkedResumeSelector'
import GenerateDocButton from './GenerateDocButton'

export default async function JobOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

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

    if (!job) {
        notFound()
    }

    // Generate Signed URL for download
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
                            Communications 📄
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes / Job Description</label>
                        <textarea
                            name="notes"
                            rows={10}
                            defaultValue={job.notes || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono text-sm"
                            placeholder="Paste the job description here or add your personal notes..."
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
