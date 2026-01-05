import { AlertCircle } from 'lucide-react'

export function NeedsReviewReason({ reasons }: { reasons?: string[] }) {
    if (!reasons || reasons.length === 0) return null

    return (
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-md p-2 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
                <p className="font-semibold mb-0.5">Needs Review</p>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                    {reasons.slice(0, 2).map((reason, i) => (
                        <li key={i}>{reason}</li>
                    ))}
                    {reasons.length > 2 && (
                        <li>+{reasons.length - 2} more issues</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
