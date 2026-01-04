import { getDashboardData } from './dashboard-service'
import CareerHealth from '@/components/dashboard/CareerHealth'
import PriorityActions from '@/components/dashboard/PriorityActions'
import PipelineOverview from '@/components/dashboard/PipelineOverview'
import AIInsights from '@/components/dashboard/AIInsights'
import RecentDocuments from '@/components/dashboard/RecentDocuments'
import { Suspense } from 'react'

export default async function DashboardPage() {
    const data = await getDashboardData()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back to your Career Operating System</p>
                </div>
                <div className="hidden md:block text-sm text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">

                {/* Left Column (Hero Stats) - Span 8 on desktop */}
                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Career Health - Span 1 of inner grid */}
                    <div className="h-full">
                        <CareerHealth stats={data.health} />
                    </div>

                    {/* AI Insights - Span 1 of inner grid */}
                    <div className="h-full">
                        <AIInsights />
                    </div>

                    {/* Pipeline Overview - Full width of Left Column */}
                    <div className="md:col-span-2">
                        <PipelineOverview stages={data.pipeline} />
                    </div>
                </div>

                {/* Right Column (Actions & Docs) - Span 4 on desktop */}
                <div className="md:col-span-4 space-y-6 flex flex-col h-full">
                    {/* Priority Actions - Takes natural height, often taller */}
                    <div className="flex-1 min-h-[300px]">
                        <PriorityActions actions={data.actions} />
                    </div>

                    {/* Recent Documents */}
                    <div>
                        <RecentDocuments docs={data.recentDocs} />
                    </div>
                </div>
            </div>
        </div>
    )
}
