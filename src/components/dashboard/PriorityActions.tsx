'use client'

import { PriorityAction } from '@/app/dashboard/dashboard-service'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, Clock, FileText, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PriorityActions({ actions }: { actions: PriorityAction[] }) {
    if (actions.length === 0) {
        return (
            <Card className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
                <p className="text-muted-foreground text-sm mt-1">You have no pending actions. Great job keeping on top of your career.</p>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-primary rounded-full"></span>
                    Needs Attention
                </CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {actions.length} Actions
                </Badge>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none custom-scrollbar">
                {actions.map((action, index) => (
                    <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${action.type === 'critical'
                            ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/30'
                            : action.type === 'warning'
                                ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30'
                                : 'bg-muted/30 border-border hover:border-primary/20'
                            }`}
                    >
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex gap-3 items-center">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${action.type === 'critical' ? 'bg-destructive/10 text-destructive' :
                                    action.type === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                                        'bg-primary/10 text-primary'
                                    }`}>
                                    {action.type === 'critical' ? <AlertCircle size={20} /> :
                                        action.type === 'warning' ? <Clock size={20} /> :
                                            <FileText size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground text-sm truncate">{action.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{action.description}</p>
                                </div>
                            </div>

                            <Button
                                asChild
                                size="sm"
                                variant={action.type === 'critical' ? 'destructive' : action.type === 'warning' ? 'secondary' : 'outline'}
                                className={`flex-shrink-0 whitespace-nowrap ${action.type === 'warning' ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : ''}`}
                            >
                                <Link href={action.actionUrl} className="gap-1 flex items-center">
                                    {action.actionLabel}
                                    {action.type === 'critical' && <ArrowRight size={12} />}
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    )
}


