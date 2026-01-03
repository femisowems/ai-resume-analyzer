'use client'

import { useState, useTransition } from 'react'
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react'
import { updateProfile } from './actions'

interface ProfileFormProps {
    user: {
        id: string
        email?: string
    }
    profile: {
        full_name: string | null
    } | null
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
        <form action={handleSubmit}>
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                    <p className="mt-1 text-sm text-gray-500">Update your account's public profile.</p>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User ID</label>
                        <div className="mt-1 flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500 text-sm font-mono">
                            {user.id}
                        </div>
                    </div>

                    {/* Read-only Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <div className="mt-1 flex items-center">
                            <div className="flex-1 flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500 text-sm">
                                <Mail className="h-4 w-4 mr-2" />
                                {user.email || 'No email provided'}
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed here.</p>
                    </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 text-right sm:px-6 flex justify-between items-center">
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
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
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
