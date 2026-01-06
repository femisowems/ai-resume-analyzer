import { Job, JobStatus } from '@/lib/types'
import { BrainCircuit, CheckCircle2, Clock, Inbox, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface IntelligenceConsoleProps {
    jobs: Job[]
}

export function IntelligenceConsole({ jobs }: IntelligenceConsoleProps) {
    const activeCount = jobs.filter(j => j.status !== 'ARCHIVED' && j.status !== 'REJECTED').length
    const interviewCount = jobs.filter(j => j.status === 'INTERVIEW').length
    const offerCount = jobs.filter(j => j.status === 'OFFER').length
    const needsAttentionCount = jobs.filter(j => {
        const days = j.updated_at
            ? Math.floor((new Date().getTime() - new Date(j.updated_at).getTime()) / (1000 * 3600 * 24))
            : 0
        return days > 14 && j.status !== 'OFFER' && j.status !== 'REJECTED'
    }).length

    return (
        <div className="space-y-6 mb-8">
            {/* AI Banner - The "Hook" */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BrainCircuit size={120} />
                </div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Sparkles className="w-6 h-6 text-yellow-200" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-1">
                            {interviewCount > 0
                                ? `Good morning. You have ${interviewCount} active interview processes.`
                                : "Your pipeline is active. Let's optimize it."
                            }
                        </h2>
                        <p className="text-indigo-100 text-sm max-w-2xl leading-relaxed">
                            {needsAttentionCount > 0
                                ? `Heads up: ${needsAttentionCount} applications have been stalled for over 2 weeks. Consider sending follow-up emails today to reactivate them.`
                                : "All applications are moving within expected timelines. Consider applying to 2 more 'High Match' roles to keep velocity up."
                            }
                        </p>
                        <Button
                            variant="secondary"
                            className="mt-4 bg-white text-indigo-900 hover:bg-indigo-50 border-transparent shadow-none"
                        >
                            View Priority Queue
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Active Pursuits"
                    value={activeCount}
                    icon={<Inbox size={18} className="text-blue-500" />}
                />
                <StatCard
                    label="Interviews"
                    value={interviewCount}
                    icon={<CheckCircle2 size={18} className="text-emerald-500" />}
                    highlight={interviewCount > 0}
                />
                <StatCard
                    label="Offers"
                    value={offerCount}
                    icon={<Sparkles size={18} className="text-purple-500" />}
                />
                <StatCard
                    label="Stalled (>14d)"
                    value={needsAttentionCount}
                    icon={<Clock size={18} className="text-amber-500" />}
                    alert={needsAttentionCount > 0}
                />
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, highlight, alert }: { label: string, value: number, icon: React.ReactNode, highlight?: boolean, alert?: boolean }) {
    return (
        <div className={`
            p-4 rounded-xl border bg-card shadow-sm flex flex-col gap-3
            ${highlight ? 'ring-2 ring-emerald-500/20 border-emerald-500/30 bg-emerald-50/10' : 'border-border'}
            ${alert ? 'ring-2 ring-amber-500/20 border-amber-500/30 bg-amber-50/10' : ''}
        `}>
            <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold text-foreground">
                {value}
            </div>
        </div>
    )
}
