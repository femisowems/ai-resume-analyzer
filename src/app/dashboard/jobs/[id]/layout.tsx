import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

import { ChevronLeft, Calendar } from 'lucide-react'
import JobTabs from '@/app/dashboard/jobs/[id]/JobTabs'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { JobHeader } from '@/components/jobs/JobHeader'

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
        .select(`
            id, 
            job_title, 
            company_name, 
            status, 
            applied_date, 
            company_logo_cache,
            match_score, 
            created_at,
            updated_at,
            user_id
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        notFound()
    }

    // Fetch Next Job (created AFTER current)

    // Fetch Next Job (created AFTER current)
    const { data: nextJob } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .gt('created_at', job.created_at) // Newer jobs
        .order('created_at', { ascending: true }) // Oldest of the newer ones
        .limit(1)
        .maybeSingle()

    // Fetch Previous Job (created BEFORE current)
    const { data: prevJob } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .lt('created_at', job.created_at) // Older jobs
        .order('created_at', { ascending: false }) // Newest of the older ones
        .limit(1)
        .maybeSingle()

    if (!job) {
        notFound()
    }


    // Cast to JobExtended for the component. 
    // We can assume the missing fields are undefined which is fine as they are optional.
    const jobExtended = { ...job, role: job.job_title } as any

    return (
        <div className="p-0 md:p-8 max-w-6xl mx-auto">
            <JobHeader
                job={jobExtended}
                nextJobId={nextJob?.id}
                prevJobId={prevJob?.id}
            />

            <div className="px-4 md:px-0">
                <JobTabs jobId={id} />

                <div className="mt-6 md:mt-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
