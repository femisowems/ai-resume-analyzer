'use client'

interface SubScoreProps {
    label: string
    value: number
    tooltip: string
}

function SubScoreBar({ label, value, tooltip }: SubScoreProps) {
    // Color logic
    const colorClass = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
    const widthPct = `${Math.max(5, value)}%`

    return (
        <div className="group relative">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{value}/100</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: widthPct }} />
            </div>
            {/* Simple Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
        </div>
    )
}

interface Props {
    overallScore: number
    subScores: {
        ats_compatibility: number
        impact_metrics: number
        clarity: number
        keyword_match: number
        seniority_fit: number
    }
}

export default function ScoreBreakdown({ overallScore, subScores }: Props) {
    const size = 120
    const strokeWidth = 8
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (overallScore / 100) * circumference

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Efficiency Score</h3>

            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Radial Dial */}
                <div className="relative flex-shrink-0">
                    <svg
                        height={size}
                        width={size}
                        className="transform -rotate-90"
                    >
                        {/* Background Circle */}
                        <circle
                            stroke="#e5e7eb"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                        />
                        {/* Progress Circle */}
                        <circle
                            stroke={overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#eab308' : '#ef4444'}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference + ' ' + circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{overallScore}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
                    </div>
                </div>

                {/* Sub Scores */}
                <div className="flex-1 w-full space-y-4">
                    <SubScoreBar
                        label="ATS Compatibility"
                        value={subScores.ats_compatibility}
                        tooltip="How well parsers read your file"
                    />
                    <SubScoreBar
                        label="Impact & Metrics"
                        value={subScores.impact_metrics}
                        tooltip="Focus on quantified results (%, $)"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <SubScoreBar
                            label="Keyword Match"
                            value={subScores.keyword_match}
                            tooltip="Alignment with job description"
                        />
                        <SubScoreBar
                            label="Clarity"
                            value={subScores.clarity}
                            tooltip="Readability and concise language"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
