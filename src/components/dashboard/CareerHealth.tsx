'use client'

import { CareerHealthStats } from '@/app/dashboard/dashboard-service'
import { motion } from 'framer-motion'

export default function CareerHealth({ stats }: { stats: CareerHealthStats }) {
    // Color logic based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500'
        if (score >= 50) return 'text-yellow-500'
        return 'text-red-500'
    }

    const strokeDasharray = 2 * Math.PI * 52; // r=52
    const strokeDashoffset = strokeDasharray * ((100 - stats.score) / 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col justify-between h-full"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-bold text-card-foreground">Career Health</h2>
                    <p className="text-sm text-muted-foreground">Weekly Snapshot</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full bg-opacity-10 ${stats.trend === 'up' ? 'bg-green-500 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {stats.trend === 'up' ? '▲ Trending Up' : 'Need Focus'}
                </div>
            </div>

            <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="52"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-muted/20"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="52"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`${getScoreColor(stats.score)} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(stats.score)}`}>{stats.score}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Score</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 border-t border-border pt-4">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-card-foreground">{stats.applicationsActive}</p>
                    <p className="text-xs text-muted-foreground">Active Apps</p>
                </div>
                <div className="text-center border-l border-border">
                    <p className="text-2xl font-semibold text-card-foreground">{stats.interviewRate}%</p>
                    <p className="text-xs text-muted-foreground">Interview Rate</p>
                </div>
            </div>
        </motion.div>
    )
}
