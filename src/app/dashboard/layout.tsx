import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNavigation from '@/components/DashboardNavigation'
import { CommandMenu } from '@/components/CommandMenu'


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile to get the name
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-background flex flex-col text-foreground">
            <CommandMenu />
            <DashboardNavigation
                userEmail={user.email}
                userName={profile?.full_name}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            <footer className="bg-background border-t border-border mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} CareerAI. Built with Next.js, Supabase & OpenAI.
                            <span className="ml-2 text-xs text-muted-foreground/60">(Press Cmd+K to search)</span>
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition">
                                Dashboard
                            </Link>
                            <Link href="/dashboard/resumes" className="text-muted-foreground hover:text-primary transition">
                                Resumes
                            </Link>
                            <Link href="/dashboard/jobs" className="text-muted-foreground hover:text-primary transition">
                                Jobs
                            </Link>
                            <Link href="/dashboard/settings" className="text-muted-foreground hover:text-primary transition">
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
