import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Logo({ className = "" }: { className?: string }) {
    return (
        <Link
            href="/dashboard"
            className={cn(
                "flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/90 transition",
                className
            )}
        >
            <div className="bg-primary rounded-lg p-1.5">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>CareerAI</span>
        </Link>
    )
}

