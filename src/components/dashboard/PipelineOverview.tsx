'use client'

import { PipelineStage } from '@/app/dashboard/dashboard-service'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function PipelineOverview({ stages }: { stages: PipelineStage[] }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Application Pipeline</h2>
                <Link href="/dashboard/jobs" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
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
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage.name}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{stage.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
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

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Conversion</p>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">12%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Avg. Time</p>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">14d</p>
                </div>
            </div>
        </div>
    )
}
