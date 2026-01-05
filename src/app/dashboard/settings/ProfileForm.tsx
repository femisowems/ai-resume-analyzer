'use client'

import { useState, useTransition } from 'react'
import { User, Mail, Shield, Save, Loader2, Target, Briefcase, Link as LinkIcon, FileText } from 'lucide-react'
import { updateProfile } from './actions'
import { Profile } from '@/lib/types'

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
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                    <p className="mt-1 text-sm text-gray-500">Update your identity details.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Full Name Input */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <User className="h-4 w-4" />
                            </span>
                            <input
                                type="text"
                                name="fullName"
                                id="fullName"
                                defaultValue={profile?.full_name || ''}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Read-only User ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">User ID</label>
                            <div className="mt-1 flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500 text-sm font-mono truncate">
                                {user.id}
                            </div>
                        </div>

                        {/* Read-only Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500 text-sm truncate">
                                <Mail className="h-4 w-4 mr-2" />
                                {user.email || 'No email provided'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Career Context (The Brain) */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-indigo-50">
                    <h2 className="text-lg font-medium text-indigo-900">Career Context (The Brain)</h2>
                    <p className="mt-1 text-sm text-indigo-700">
                        This data powers the AI. The more you add, the better your results.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Target Roles */}
                    <div>
                        <label htmlFor="targetRoles" className="block text-sm font-medium text-gray-700">
                            Target Roles (Comma separated)
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <Target className="h-4 w-4" />
                            </span>
                            <input
                                type="text"
                                name="targetRoles"
                                id="targetRoles"
                                defaultValue={profile?.target_roles?.join(', ') || ''}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Senior Frontend Engineer, Full Stack Developer"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">These are the titles the AI will optimize for.</p>
                    </div>

                    {/* Skills */}
                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                            Top Skills (Comma separated)
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <Briefcase className="h-4 w-4" />
                            </span>
                            <input
                                type="text"
                                name="skills"
                                id="skills"
                                defaultValue={profile?.skills?.join(', ') || ''}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="React, TypeScript, Next.js, Tailwind CSS"
                            />
                        </div>
                    </div>

                    {/* Experience Summary */}
                    <div>
                        <label htmlFor="experienceSummary" className="block text-sm font-medium text-gray-700">
                            Experience Summary / Bio
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="experienceSummary"
                                name="experienceSummary"
                                rows={4}
                                defaultValue={profile?.experience_summary || ''}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                                placeholder="I have 5 years of experience building scalable web applications with React..."
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">This bio is used to inject your "voice" into cover letters.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Years of Experience */}
                        <div>
                            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                                Years of Experience
                            </label>
                            <input
                                type="number"
                                name="yearsOfExperience"
                                id="yearsOfExperience"
                                defaultValue={profile?.years_of_experience || ''}
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* LinkedIn URL */}
                        <div>
                            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                                LinkedIn URL
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                    <LinkIcon className="h-4 w-4" />
                                </span>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    id="linkedinUrl"
                                    defaultValue={profile?.linkedin_url || ''}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Portfolio URL */}
                    <div>
                        <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700">
                            Portfolio / Personal Website
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <LinkIcon className="h-4 w-4" />
                            </span>
                            <input
                                type="url"
                                name="portfolioUrl"
                                id="portfolioUrl"
                                defaultValue={profile?.portfolio_url || ''}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="https://myportfolio.com"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-3 bg-gray-50 text-right sm:px-6 flex justify-between items-center bg-white shadow rounded-lg">
                <div className="text-sm">
                    {message && (
                        <span className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                            {message.text}
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="-ml-1 mr-2 h-4 w-4" />
                            Save Profile
                        </>
                    )}
                </button>
            </div>


            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Security</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your password and authentication.</p>
                </div>
                <div className="p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                            <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">Password</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Password management is currently handled via the login page recovery flow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
