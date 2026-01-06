import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateJobApplication } from '../actions'
import { fetchApplicationAssets } from '../actions-assets'
import { JobTimeline } from '@/components/jobs/JobTimeline'
import { ApplicationAssets } from '@/components/jobs/ApplicationAssets'
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    // parallel fetching
    const [jobResponse, timelineResponse, assetsData] = await Promise.all([
        supabase
            .from('job_applications')
            .select(`
                *,
                resume_version:resume_versions!resume_version_id(
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

        fetchApplicationAssets(id)
    ])

    const job = jobResponse.data
    const events = timelineResponse.data || []

    if (!job) {
        notFound()
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: 2/3 width */}
            <div className="lg:col-span-2 space-y-8">

                {/* Application Assets - New Blueprint-Based UI */}
                <ApplicationAssets
                    jobId={id}
                    jobStage={job.status}
                    assetsData={assetsData}
                />


            </div>

            {/* Sidebar: 1/3 width */}
            <div className="space-y-8">

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

                {/* Timeline - Moved to Right Column */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                    <JobTimeline events={events} />
                </div>

                {/* Notes - Moved to Right Column */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Private Notes</h3>
                    <form action={updateJobApplication}>
                        <input type="hidden" name="id" value={job.id} />
                        <textarea
                            name="notes"
                            rows={6}
                            defaultValue={job.notes || ''}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3"
                            placeholder="Jot down quick notes..."
                        />
                        <div className="mt-3 flex justify-end">
                            <button type="submit" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Save Notes</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}
