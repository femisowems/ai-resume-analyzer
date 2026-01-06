'use client'

import { CareerHealthStats } from '@/app/dashboard/dashboard-service'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CareerHealth({ stats }: { stats: CareerHealthStats }) {
    // Color logic based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 50) return 'text-amber-600'
        return 'text-destructive'
    }

    const strokeDasharray = 2 * Math.PI * 52; // r=52
    const strokeDashoffset = strokeDasharray * ((100 - stats.score) / 100);

    return (
        <div className="h-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full"
            >
                <Card className="h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                            <CardTitle>Career Health</CardTitle>
                            <CardDescription>Weekly Snapshot</CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className={`ml-2 ${stats.trend === 'up' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground border-transparent'}`}
                        >
                            {stats.trend === 'up' ? '▲ Trending Up' : 'Need Focus'}
                        </Badge>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col items-center justify-center py-4">
                        <div className="relative w-40 h-40">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="52"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-muted/30"
                                />
                                /* Progress Circle */
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="52"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`${getScoreColor(stats.score)} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${getScoreColor(stats.score)}`}>{stats.score}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-1">Score</span>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mt-6 border-t border-border pt-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{stats.applicationsActive}</p>
                                <p className="text-xs text-muted-foreground font-medium">Active Apps</p>
                            </div>
                            <div className="text-center border-l border-border pl-4">
                                <p className="text-2xl font-bold text-foreground">{stats.interviewRate}%</p>
                                <p className="text-xs text-muted-foreground font-medium">Interview Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

