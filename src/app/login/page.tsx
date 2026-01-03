'use client'

import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            if (activeTab === 'login') {
                await login(formData)
            } else {
                await signup(formData)
            }
        })
    }

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'login'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'signup'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                                required
                                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {activeTab === 'login' && (
                        <div className="flex items-center justify-end">
                            <Link
                                href="/reset-password"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex w-full justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                {activeTab === 'login' ? 'Signing in...' : 'Creating account...'}
                            </>
                        ) : (
                            activeTab === 'login' ? 'Sign in' : 'Create account'
                        )}
                    </button>
                </form>

                {activeTab === 'signup' && (
                    <p className="mt-4 text-xs text-gray-500 text-center">
                        By signing up, you'll receive a verification email to confirm your account.
                    </p>
                )}
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Welcome to CareerAI
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to optimize your resume and land more interviews
                </p>
            </div>

            <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
                <LoginForm />
            </Suspense>

            <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
                    ← Back to home
                </Link>
            </div>
        </div>
    )
}
