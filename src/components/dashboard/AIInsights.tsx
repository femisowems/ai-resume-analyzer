'use client'

import { motion } from 'framer-motion'
import { Sparkles, Lightbulb } from 'lucide-react'

export default function AIInsights() {
    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-purple-400 opacity-20 rounded-full blur-xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Sparkles size={20} className="text-yellow-300" />
                    </div>
                    <h2 className="font-bold text-lg tracking-tight">AI Coach Insights</h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex gap-3 items-start">
                            <Lightbulb size={18} className="text-yellow-300 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-sm mb-1 text-white">Optimize for 'Product Manager'</h3>
                                <p className="text-xs text-indigo-100 leading-relaxed">
                                    Your resume match score drops by 15% for Senior roles. Consider highlighting "Strategic Roadmapping" and "Cross-functional Leadership" more prominently in your summary.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex gap-3 items-start">
                            <div className="shrink-0 w-4 h-4 rounded-full bg-green-400 mt-1"></div>
                            <div>
                                <h3 className="font-bold text-sm mb-1 text-white">Momentum is building!</h3>
                                <p className="text-xs text-indigo-100 leading-relaxed">
                                    You've applied to 5 jobs this week, up 20% from last week. Keep this pace to maximize interview chances by mid-month.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <button className="w-full mt-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-sm">
                    Generate New Report
                </button>
            </div>
        </div>
    )
}
