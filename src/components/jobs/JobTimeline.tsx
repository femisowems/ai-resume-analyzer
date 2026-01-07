'use client'

import { JobTimelineEvent } from '@/lib/types'
import { Calendar, CheckCircle, Mail, MessageSquare, FileText, ArrowRight } from 'lucide-react'

interface JobTimelineProps {
    events: JobTimelineEvent[]
}

export function JobTimeline({ events = [] }: JobTimelineProps) {
    const limitedEvents = events.slice(0, 3)

    if (limitedEvents.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <p className="text-sm text-gray-500">No activity recorded yet.</p>
            </div>
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'stage_change': return CheckCircle
            case 'email_sent': return Mail
            case 'interview_scheduled': return Calendar
            case 'document_created': return FileText
            case 'note_added': return MessageSquare
            default: return ArrowRight
        }
    }

    const getColor = (type: string) => {
        switch (type) {
            case 'stage_change': return 'bg-green-100 text-green-600'
            case 'email_sent': return 'bg-blue-100 text-blue-600'
            case 'interview_scheduled': return 'bg-purple-100 text-purple-600'
            case 'document_created': return 'bg-orange-100 text-orange-600'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {limitedEvents.map((event, eventIdx) => {
                    const Icon = getIcon(event.event_type)
                    return (
                        <li key={event.id}>
                            <div className="relative pb-4">
                                {eventIdx !== limitedEvents.length - 1 ? (
                                    <span className="absolute top-3 left-3 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-white ${getColor(event.event_type)}`}>
                                        <Icon className="h-3 w-3" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                <span className="font-medium text-gray-700">{event.title}</span> {event.description}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs whitespace-nowrap text-gray-400">
                                            <time dateTime={event.occurred_at}>{new Date(event.occurred_at).toLocaleDateString()}</time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
