"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Logo from '@/components/Logo'
import { MAIN_NAVIGATION } from '@/config/navigation'
import { cn } from '@/lib/utils'

interface DashboardNavigationProps {
    userEmail?: string | null
    userName?: string | null
}

export default function DashboardNavigation({ userEmail, userName }: DashboardNavigationProps) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    // Helper to determine if a link is active
    const isActive = (path: string, exact = false) => {
        if (exact) return pathname === path
        return pathname === path || pathname?.startsWith(`${path}/`)
    }

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const displayName = userName || userEmail || 'User';
    const initial = (userName ? userName[0] : (userEmail ? userEmail[0] : 'U')).toUpperCase();

    return (
        <nav className="bg-background shadow-sm border-b border-border relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0 flex items-center">
                            <Logo />
                        </div>
                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex sm:space-x-1">
                            {MAIN_NAVIGATION.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        isActive(item.href, item.exact)
                                            ? "bg-secondary text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "mr-2 h-4 w-4",
                                        isActive(item.href, item.exact) ? "text-foreground" : "text-muted-foreground"
                                    )} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* User Menu & Mobile Toggle */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center gap-2">

                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                                    {initial}
                                </div>
                                <span className="hidden md:block max-w-[100px] truncate text-sm font-medium text-foreground">{displayName}</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-popover ring-1 ring-black ring-opacity-5 focus:outline-none border border-border animate-in fade-in zoom-in-95 duration-100">
                                    <div className="grid gap-1 p-2">
                                        <div className="px-2 py-1.5 text-sm font-semibold text-foreground border-b border-border/50 mb-1">
                                            My Account
                                        </div>
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center px-2 py-2 text-sm text-muted-foreground rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center px-2 py-2 text-sm text-muted-foreground rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>

                                        <div className="border-t border-border/50 my-1"></div>

                                        <form action="/auth/signout" method="post" className="w-full">
                                            <button
                                                type="submit"
                                                className="flex w-full items-center px-2 py-2 text-sm text-red-600 rounded-sm hover:bg-red-50 hover:text-red-700 transition-colors"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Sign out
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
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
                <div className="sm:hidden border-t border-border bg-background">
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
                                    {initial}
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-foreground">{displayName}</div>
                                <div className="text-sm font-medium text-muted-foreground">{userEmail}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                href="/dashboard/settings"
                                className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Settings
                            </Link>
                            <form action="/auth/signout" method="post">
                                <button
                                    type="submit"
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
