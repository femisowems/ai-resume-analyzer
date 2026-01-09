'use client'

import { useState, useTransition } from 'react'
import { User, Mail, Shield, Save, Loader2, Target, Briefcase, Link as LinkIcon, FileText } from 'lucide-react'
import { updateProfile } from './actions'
import { Profile } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TagInput } from "@/components/ui/tag-input"

interface ProfileFormProps {
    user: {
        id: string
        email?: string
    }
    profile: Profile | null
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setMessage(null)
        startTransition(async () => {
            try {
                await updateProfile(formData)
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000)
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Identity & Security (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Identity Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Identity</CardTitle>
                            <CardDescription>Your personal account details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Avatar / Name */}
                            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg mb-4">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mb-3">
                                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        defaultValue={profile?.full_name || ''}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">User ID</label>
                                <div className="flex items-center p-2 rounded-md bg-muted text-xs font-mono text-muted-foreground break-all">
                                    {user.id}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Security</CardTitle>
                            <CardDescription>Managed via authentication provider.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-100 rounded-md">
                                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-green-800">Account Secured</h3>
                                    <p className="text-xs text-green-700 mt-1">
                                        Password resets and MFA are handled securely by Supabase Auth.
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4" type="button" disabled>
                                Reset Password (Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Online Presence</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="linkedinUrl" className="text-sm font-medium">LinkedIn URL</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        id="linkedinUrl"
                                        defaultValue={profile?.linkedin_url || ''}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="portfolioUrl" className="text-sm font-medium">Portfolio / Website</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        name="portfolioUrl"
                                        id="portfolioUrl"
                                        defaultValue={profile?.portfolio_url || ''}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="https://myportfolio.com"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Career Intelligence (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    <Card className="border-indigo-100 shadow-sm">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50 pb-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Briefcase className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-indigo-950">Career Intelligence Profile</CardTitle>
                                    <CardDescription className="text-indigo-900/70">
                                        This data calibrates your AI assistant to write exactly like you.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-8 pt-6">

                            {/* Target Roles */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="targetRoles" className="text-base font-semibold text-foreground">Target Roles</label>
                                    <span className="text-xs text-muted-foreground">Press Enter to add</span>
                                </div>
                                <TagInput
                                    name="targetRoles"
                                    placeholder="e.g. Senior Frontend Engineer, Product Manager"
                                    defaultValue={profile?.target_roles || []}
                                />
                                <p className="text-xs text-muted-foreground">The specific job titles you are aiming for.</p>
                            </div>

                            {/* Skills */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="skills" className="text-base font-semibold text-foreground">Top Skills</label>
                                    <span className="text-xs text-muted-foreground">Press Enter to add</span>
                                </div>
                                <TagInput
                                    name="skills"
                                    placeholder="e.g. React, Python, Strategic Planning"
                                    defaultValue={profile?.skills || []}
                                />
                                <p className="text-xs text-muted-foreground">Your core competencies that should appear in every resume.</p>
                            </div>

                            {/* Years of Experience */}
                            <div className="space-y-2">
                                <label htmlFor="yearsOfExperience" className="text-base font-semibold text-foreground">Years of Experience</label>
                                <input
                                    type="number"
                                    name="yearsOfExperience"
                                    id="yearsOfExperience"
                                    defaultValue={profile?.years_of_experience || ''}
                                    className="flex h-10 w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label htmlFor="experienceSummary" className="text-base font-semibold text-foreground">Professional Bio</label>
                                <textarea
                                    id="experienceSummary"
                                    name="experienceSummary"
                                    rows={8}
                                    defaultValue={profile?.experience_summary || ''}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Briefly describe your career highlights, unique value proposition, and what you bring to the table..."
                                />
                                <p className="text-xs text-muted-foreground">Used to inject your "voice" into cover letters and summaries.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2">
                        {message && (
                            <div className={`text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => window.location.reload()}
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="min-w-[140px]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="-ml-1 mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
