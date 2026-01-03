import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Logo({ className = "" }: { className?: string }) {
    return (
        <Link
            href="/dashboard"
            className={`flex items-center space-x-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition ${className}`}
        >
            <div className="bg-indigo-600 rounded-lg p-1.5">
                <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span>CareerAI</span>
        </Link>
    )
}
