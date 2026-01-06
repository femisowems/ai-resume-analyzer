'use client'

import { PipelineStage } from '@/app/dashboard/dashboard-service'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PipelineOverview({ stages }: { stages: PipelineStage[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <CardTitle className="text-lg font-bold">Application Pipeline</CardTitle>
                <Button variant="link" className="h-auto p-0 text-primary" asChild>
                    <Link href="/dashboard/jobs" className="flex items-center gap-1">
                        View Board <ChevronRight size={16} />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {stages.map((stage, index) => (
                        <motion.div
                            key={stage.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-medium text-muted-foreground">{stage.name}</span>
                                <span className="text-sm font-bold text-foreground">{stage.count}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
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

                <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/50 rounded-xl text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Conversion</p>
                        <p className="font-bold text-foreground text-lg">12%</p>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-xl text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avg. Time</p>
                        <p className="font-bold text-foreground text-lg">14d</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

