'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false)

    if (!showConfirm) {
        return (
            <button
                onClick={() => setShowConfirm(true)}
                className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 bg-red-50 px-4 py-2 rounded hover:bg-red-100 transition flex items-center"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sign out of CareerAI?
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to sign out? You'll need to sign in again to access your account.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <form action="/auth/signout" method="post" className="flex-1">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
                        >
                            Sign out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
