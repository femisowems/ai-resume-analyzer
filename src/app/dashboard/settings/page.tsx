import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'
import LogoutButton from '@/components/LogoutButton'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Account Settings</h1>
                <form action="/auth/signout" method="post">
                    <button
                        type="submit"
                        className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 bg-red-50 px-4 py-2 rounded hover:bg-red-100 transition"
                    >
                        Sign out
                    </button>
                </form>
            </div>

            <ProfileForm user={user} profile={profile} />
        </div>
    )
}
