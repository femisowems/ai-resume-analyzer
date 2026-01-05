import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ContactsPanel } from '@/components/jobs/ContactsPanel'

export default async function JobContactsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    // Check if job exists first
    const { data: job } = await supabase
        .from('job_applications')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        notFound()
    }

    // Fetch contacts
    const { data: contacts } = await supabase
        .from('job_contacts')
        .select('*')
        .eq('job_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-6xl mx-auto">
            <ContactsPanel contacts={contacts || [] as any} jobId={id} />
        </div>
    )
}
