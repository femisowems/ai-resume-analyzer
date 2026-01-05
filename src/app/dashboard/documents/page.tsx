import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDocuments } from './actions'
import DocumentsDashboard from './DocumentsDashboard'

export default async function DocumentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const documents = await getDocuments()

    return (
        <DocumentsDashboard documents={documents} />
    )
}
