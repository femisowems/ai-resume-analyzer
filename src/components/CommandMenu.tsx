'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import {
    BriefcaseIcon,
    FileTextIcon,
    PlusIcon,
    SearchIcon,
    UploadIcon,
    HomeIcon
} from 'lucide-react'
import { getLinkableJobs, getDocuments } from '@/app/dashboard/documents/actions'

export function CommandMenu() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [jobs, setJobs] = React.useState<any[]>([])
    const [docs, setDocs] = React.useState<any[]>([])

    // Toggle logic
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    // Data fetching on open
    React.useEffect(() => {
        if (open) {
            // Load data when menu opens
            Promise.all([
                getLinkableJobs(),
                getDocuments()
            ]).then(([jobsData, docsData]) => {
                setJobs(jobsData)
                setDocs(docsData)
            })
        }
    }, [open])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-popover rounded-xl shadow-2xl border border-border overflow-hidden z-50 p-0 text-popover-foreground"
        >
            <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
                <SearchIcon className="w-5 h-5 text-muted-foreground mr-2" />
                <Command.Input
                    placeholder="Type to search..."
                    className="w-full h-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent"
                />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scroll-py-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/dashboard'))}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                        <HomeIcon className="w-4 h-4" />
                        Dashboard
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/dashboard/jobs'))}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                        <BriefcaseIcon className="w-4 h-4" />
                        All Jobs
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/dashboard/documents'))}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                        <FileTextIcon className="w-4 h-4" />
                        All Documents
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Actions" className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/dashboard/jobs?new=true'))}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Create New Job
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/dashboard/resumes?upload=true'))}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                        <UploadIcon className="w-4 h-4" />
                        Upload Resume
                    </Command.Item>
                </Command.Group>

                {jobs.length > 0 && (
                    <Command.Group heading="Recent Jobs" className="text-xs font-medium text-muted-foreground mb-2 px-2">
                        {jobs.map((job) => (
                            <Command.Item
                                key={job.id}
                                value={`${job.jobTitle} ${job.companyName}`}
                                onSelect={() => runCommand(() => router.push(`/dashboard/jobs/${job.id}`))}
                                className="flex items-center justify-between px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <BriefcaseIcon className="w-4 h-4 opacity-50" />
                                    <span className="truncate">{job.jobTitle} at {job.companyName}</span>
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">{job.status.toLowerCase()}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

                {docs.length > 0 && (
                    <Command.Group heading="Recent Documents" className="text-xs font-medium text-muted-foreground mb-2 px-2">
                        {docs.slice(0, 5).map((doc) => (
                            <Command.Item
                                key={doc.id}
                                value={doc.title}
                                onSelect={() => runCommand(() => router.push(`/dashboard/documents?view=${doc.id}`))}
                                className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <FileTextIcon className="w-4 h-4 opacity-50" />
                                <span className="truncate">{doc.title}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}
            </Command.List>

            <div className="border-t border-border p-2 bg-muted text-[10px] text-muted-foreground flex justify-between px-4">
                <span>Navigate using arrows</span>
                <span>Enter to select</span>
                <span>Esc to close</span>
            </div>
        </Command.Dialog>
    )
}
