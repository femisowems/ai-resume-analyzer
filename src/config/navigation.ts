
import { LayoutDashboard, FileText, Briefcase, File, User, type LucideIcon } from 'lucide-react'

export interface NavigationItem {
    name: string
    href: string
    icon: LucideIcon
    exact?: boolean
}

export const MAIN_NAVIGATION: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        exact: true
    },
    {
        name: 'Resumes',
        href: '/dashboard/resumes',
        icon: FileText
    },
    {
        name: 'Jobs',
        href: '/dashboard/jobs',
        icon: Briefcase
    },
    {
        name: 'Documents',
        href: '/dashboard/documents',
        icon: File
    },
]

export const USER_NAVIGATION: NavigationItem[] = [
    {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: User
    }
]
