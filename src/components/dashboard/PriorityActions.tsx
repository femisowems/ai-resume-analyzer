'use client'

import { PriorityAction } from '@/app/dashboard/dashboard-service'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, Clock, FileText, CheckCircle, ArrowRight } from 'lucide-react'

export default function PriorityActions({ actions }: { actions: PriorityAction[] }) {
    if (actions.length === 0) {
        return (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">All Caught Up!</h3>
                <p className="text-muted-foreground text-sm mt-1">You have no pending actions. Great job keeping on top of your career.</p>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                    Needs Attention
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                    {actions.length} Actions
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                {actions.map((action, index) => (
                    <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${action.type === 'critical'
                            ? 'bg-red-50/50 border-red-100 hover:border-red-200'
                            : action.type === 'warning'
                                ? 'bg-amber-50/50 border-amber-100 hover:border-amber-200'
                                : 'bg-muted/40 border-border hover:border-border/80'
                            }`}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${action.type === 'critical' ? 'bg-red-100 text-red-600' :
                                    action.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {action.type === 'critical' ? <AlertCircle size={20} /> :
                                        action.type === 'warning' ? <Clock size={20} /> :
                                            <FileText size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-card-foreground text-sm">{action.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{action.description}</p>
                                </div>
                            </div>

                            <Link
                                href={action.actionUrl}
                                className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${action.type === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' :
                                    action.type === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                        'bg-muted border border-border text-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {action.actionLabel}
                                {action.type === 'critical' && <ArrowRight size={12} />}
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
