import Link from 'next/link'
import Logo from '@/components/Logo'
import { Mail, CheckCircle } from 'lucide-react'

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Check your email
                    </h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a verification link to your email address. Click the link to activate your account.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                        <div className="flex items-start">
                            <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-left">
                                <p className="font-medium text-blue-900 mb-1">Didn't receive the email?</p>
                                <p className="text-blue-700">
                                    Check your spam folder or wait a few minutes. The email should arrive shortly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/login"
                            className="block w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
                        >
                            Back to sign in
                        </Link>
                        <Link
                            href="/"
                            className="block text-sm text-gray-500 hover:text-indigo-600"
                        >
                            Return to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
