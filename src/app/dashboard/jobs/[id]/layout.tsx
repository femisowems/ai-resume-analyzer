import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Briefcase, Calendar } from 'lucide-react'
import JobTabs from './JobTabs'

export default async function JobDetailLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { id } = await params

    // Fetch basic job info for the header
    const { data: job } = await supabase
        .from('job_applications')
        .select('id, job_title, company_name, status, applied_date')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        notFound()
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/jobs" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Jobs
                </Link>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{job.job_title}</h1>
                        <div className="flex items-center mt-2 text-gray-500 text-sm">
                            <Briefcase className="w-4 h-4 mr-1.5" />
                            <span className="font-medium mr-4 text-gray-700">{job.company_name}</span>
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>Applied: {new Date(job.applied_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full uppercase tracking-wide
                        ${job.status === 'offer' ? 'bg-green-100 text-green-800' :
                            job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                job.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                                    'bg-blue-100 text-blue-800'}`}>
                        {job.status}
                    </span>
                </div>
            </div>

            <JobTabs jobId={id} />

            <div className="mt-8">
                {children}
            </div>
        </div>
    )
}
