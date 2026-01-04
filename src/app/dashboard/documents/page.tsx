import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDocuments } from './actions'
import DocumentsClient from './DocumentsClient'

export default async function DocumentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const documents = await getDocuments()

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Document Hub</h1>
                    <p className="text-gray-600 mt-2">Manage your resumes and AI-generated application documents</p>
                </div>
            </div>

            <DocumentsClient documents={documents} />
        </div>
    )
}
