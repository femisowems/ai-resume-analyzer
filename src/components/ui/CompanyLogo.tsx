'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyLogoProps {
    jobId?: string
    companyName: string
    logoUrl?: string | null
    className?: string
    size?: number
    jobUrl?: string
}

export function CompanyLogo({
    jobId,
    companyName,
    logoUrl: initialLogoUrl,
    className,
    size = 40,
    jobUrl
}: CompanyLogoProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null)
    const [hasError, setHasError] = useState(false)
    const [isResolving, setIsResolving] = useState(false)

    // Sync prop changes
    useEffect(() => {
        if (initialLogoUrl) {
            setLogoUrl(initialLogoUrl)
            setHasError(false)
        }
    }, [initialLogoUrl])

    // Auto-resolve if missing
    useEffect(() => {
        const shouldResolve = !logoUrl && !hasError && !isResolving && (jobId || companyName)

        if (shouldResolve) {
            // Check session storage to avoid spamming API on every nav
            const cacheKey = `resolved_logo_${jobId || companyName}`
            if (typeof window !== 'undefined' && sessionStorage.getItem(cacheKey)) {
                return
            }

            setIsResolving(true)

            // Fire and forget resolution
            fetch('/api/companies/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, companyName, jobUrl })
            })
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json()
                        if (data.logo_url) {
                            setLogoUrl(data.logo_url)
                        }
                    }
                })
                .catch(() => {
                    // Ignore errors
                })
                .finally(() => {
                    setIsResolving(false)
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem(cacheKey, 'true')
                    }
                })
        }
    }, [jobId, companyName, jobUrl, logoUrl, hasError, isResolving])

    // Fallback content (Initials or Icon)
    const renderFallback = () => {
        // Initials logic
        const initials = companyName
            .split(' ')
            .map(w => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()

        if (initials.length > 0) {
            return <span className="text-xs font-bold">{initials}</span>
        }

        return <Building2 size={size * 0.5} />
    }

    if (hasError || !logoUrl) {
        return (
            <div
                className={cn(
                    "rounded-md bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 overflow-hidden",
                    className
                )}
                style={{ width: size, height: size }}
            >
                {renderFallback()}
            </div>
        )
    }

    return (
        <div
            className={cn(
                "relative rounded-md bg-white flex items-center justify-center border border-slate-200 overflow-hidden",
                className
            )}
            style={{ width: size, height: size }}
        >
            <Image
                src={logoUrl}
                alt={`${companyName} logo`}
                width={size}
                height={size}
                className="object-contain p-1"
                onError={() => setHasError(true)}
                unoptimized // Brandfetch images are external
            />
        </div>
    )
}
