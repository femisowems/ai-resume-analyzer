'use client'

import { PipelineStage } from '@/app/dashboard/dashboard-service'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function PipelineOverview({ stages }: { stages: PipelineStage[] }) {
    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-card-foreground">Application Pipeline</h2>
                <Link href="/dashboard/jobs" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center">
                    View Board <ChevronRight size={16} />
                </Link>
            </div>

            <div className="space-y-4">
                {stages.map((stage, index) => (
                    <motion.div
                        key={stage.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-muted-foreground">{stage.name}</span>
                            <span className="text-sm font-bold text-card-foreground">{stage.count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.count > 0 ? (stage.count / 10) * 100 : 0}%` }} // Simplified scale
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-2.5 rounded-full ${stage.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                                style={{ maxWidth: '100%' }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversion</p>
                    <p className="font-bold text-card-foreground text-lg">12%</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg. Time</p>
                    <p className="font-bold text-card-foreground text-lg">14d</p>
                </div>
            </div>
        </div>
    )
}
