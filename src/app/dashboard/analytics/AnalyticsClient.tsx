'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, Target, Clock, CheckCircle, XCircle } from 'lucide-react'

interface AnalyticsDashboardProps {
    data: {
        kpis: {
            totalApplications: number
            interviewRate: number
            responseRate: number
            activePipeline: number
        }
        activity: {
            date: string
            count: number
        }[]
        insights: {
            topStrength: string
            bottleneck: string
        }
    }
}

export default function AnalyticsClient({ data }: AnalyticsDashboardProps) {
    // Compute max for chart scaling
    const maxActivity = Math.max(...data.activity.map(d => d.count), 1)

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Career Intelligence</h1>
                <p className="text-gray-500 mt-2">Data-driven insights to optimize your job search strategy.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Applications"
                    value={data.kpis.totalApplications}
                    icon={Target}
                    trend="Lifetime"
                />
                <KPICard
                    title="Interview Rate"
                    value={`${(data.kpis.interviewRate * 100).toFixed(1)}%`}
                    icon={CheckCircle}
                    trend="Conversion"
                    trendColor={data.kpis.interviewRate > 0.1 ? 'text-green-600' : 'text-yellow-600'}
                />
                <KPICard
                    title="Response Rate"
                    value={`${(data.kpis.responseRate * 100).toFixed(1)}%`}
                    icon={Clock}
                    trend="Any Reply"
                />
                <KPICard
                    title="Active Pipeline"
                    value={data.kpis.activePipeline}
                    icon={TrendingUp}
                    trend="In Play"
                    trendColor="text-indigo-600"
                />
            </div>

            {/* Visualizations & Insights Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Activity Chart (CSS-Only) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Activity (Last 30 Days)</h3>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {data.activity.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                                    {day.date}: {day.count} apps
                                </div>
                                {/* Bar */}
                                <div
                                    className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all cursor-pointer min-w-[4px]"
                                    style={{ height: `${(day.count / maxActivity) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                                />

                            </div>
                        ))}
                    </div>
                    {/* X-Axis Labels (Simplified) */}
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>30 Days Ago</span>
                        <span>Today</span>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Strategic Insights
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Top Strength</p>
                            <p className="text-gray-900 font-medium">{data.insights.topStrength || "Not enough data"}</p>
                            <p className="text-xs text-gray-500 mt-1">Found in your most successful applications.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-50 shadow-sm">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Primary Bottleneck</p>
                            <p className="text-gray-900 font-medium">{data.insights.bottleneck || "Looking good!"}</p>
                            <p className="text-xs text-gray-500 mt-1">Most common drop-off point.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-indigo-100">
                        <p className="text-sm text-indigo-800 italic">
                            "Consistency is key. Aim for 5 applications per week to maintain momentum."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function KPICard({ title, value, icon: Icon, trend, trendColor = 'text-gray-500' }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                {trend && (
                    <p className={`text-xs font-medium mt-1 ${trendColor}`}>
                        {trend}
                    </p>
                )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-400">
                <Icon className="w-6 h-6" />
            </div>
        </div>
    )
}
