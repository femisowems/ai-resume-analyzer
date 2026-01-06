export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>
                <div className="hidden md:block h-4 w-32 bg-gray-200 rounded" />
            </div>

            {/* Bento Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
                {/* Left Column */}
                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Career Health */}
                    <div className="h-[200px] bg-gray-100 rounded-2xl animate-pulse" />

                    {/* AI Insights */}
                    <div className="h-[200px] bg-gray-100 rounded-2xl animate-pulse" />

                    {/* Pipeline Overview */}
                    <div className="md:col-span-2 h-[300px] bg-gray-100 rounded-2xl animate-pulse" />
                </div>

                {/* Right Column */}
                <div className="md:col-span-4 space-y-6 flex flex-col h-full">
                    {/* Priority Actions */}
                    <div className="flex-1 min-h-[300px] bg-gray-100 rounded-2xl animate-pulse" />

                    {/* Recent Documents */}
                    <div className="h-[200px] bg-gray-100 rounded-2xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}
