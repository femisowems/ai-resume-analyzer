export default function Loading() {
    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    <div className="flex gap-2">
                        <div className="h-5 w-20 bg-gray-200 rounded"></div>
                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Viewer Skeleton */}
            <div className="bg-gray-100 border border-gray-200 rounded-xl h-[800px] w-full"></div>
        </div>
    )
}
