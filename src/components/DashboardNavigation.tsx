"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { MAIN_NAVIGATION, USER_NAVIGATION } from '@/config/navigation'

interface DashboardNavigationProps {
    userEmail?: string | null
}

export default function DashboardNavigation({ userEmail }: DashboardNavigationProps) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Helper to determine if a link is active
    const isActive = (path: string, exact = false) => {
        if (exact) return pathname === path
        return pathname === path || pathname?.startsWith(`${path}/`)
    }

    return (
        <nav className="bg-background shadow-sm border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Logo />
                        </div>
                        {/* Desktop Navigation */}
                        <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                            {MAIN_NAVIGATION.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActive(item.href, item.exact)
                                        ? 'border-primary text-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 mr-2 ${isActive(item.href, item.exact) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                        }`} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* User Menu & Mobile Toggle */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {USER_NAVIGATION.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center text-sm text-muted-foreground hover:text-primary transition"
                            >
                                <item.icon className="w-4 h-4 mr-2" />
                                {userEmail}
                            </Link>
                        ))}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            type="button"
                            className="bg-background inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden border-t border-border">
                    <div className="pt-2 pb-3 space-y-1">
                        {MAIN_NAVIGATION.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive(item.href, item.exact)
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center">
                                    <item.icon className={`w-5 h-5 mr-3 ${isActive(item.href, item.exact) ? 'text-primary' : 'text-muted-foreground'
                                        }`} />
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-border">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {userEmail?.[0].toUpperCase()}
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-foreground">User</div>
                                <div className="text-sm font-medium text-muted-foreground">{userEmail}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            {USER_NAVIGATION.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
