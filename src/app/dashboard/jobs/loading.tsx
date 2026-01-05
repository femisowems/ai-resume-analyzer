export default function JobsLoading() {
    return (
        <div className="h-[calc(100vh-64px)] bg-slate-50 flex flex-col">
            {/* Header Skeleton */}
            <div className="flex-shrink-0 px-6 pt-6 pb-2 flex justify-between items-center animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 w-32 bg-slate-200 rounded" />
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                </div>
                <div className="h-10 w-32 bg-slate-200 rounded-lg" />
            </div>

            {/* Intelligence Console Skeleton */}
            <div className="px-6 py-4 animate-pulse">
                <div className="h-24 bg-white/50 rounded-xl" />
            </div>

            {/* Pipeline Board Skeleton */}
            <div className="flex-1 overflow-x-hidden px-6 pb-6 mt-4">
                <div className="flex gap-6 h-full">
                    {/* Create 4 column skeletons */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-shrink-0 w-80 flex flex-col gap-4">
                            {/* Column Header */}
                            <div className="h-8 w-full bg-slate-200 rounded-lg animate-pulse" />

                            {/* Cards */}
                            <div className="h-40 w-full bg-white rounded-xl shadow-sm animate-pulse" />
                            <div className="h-40 w-full bg-white rounded-xl shadow-sm animate-pulse" />
                            <div className="h-40 w-full bg-white rounded-xl shadow-sm animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
