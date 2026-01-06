'use client'

import { useState } from 'react'
import { JobExtended } from '@/lib/types'
import { MessageSquare, RefreshCw, ChevronRight, ChevronLeft, Eye, EyeOff, CheckCircle2, Award, Zap, BookOpen } from 'lucide-react'
import { triggerInterviewPrep } from '@/app/dashboard/jobs/actions-analysis'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InterviewPrepViewProps {
    prep?: JobExtended['interview_prep_json']
    jobId?: string
}

export function InterviewPrepView({ prep, jobId }: InterviewPrepViewProps) {
    const [mode, setMode] = useState<'list' | 'practice'>('practice')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [isRevealed, setIsRevealed] = useState(false)

    if (!prep) {
        return (
            <div className="text-center py-16 bg-card rounded-xl shadow-sm border border-border">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Interview Integration Missing</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    Connect your resume to the job description to generate targeted interview questions and STAR method answers.
                </p>
                {jobId && (
                    <form action={triggerInterviewPrep.bind(null, jobId)}>
                        <button type="submit" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Generate Questions
                        </button>
                    </form>
                )}
            </div>
        )
    }

    const currentQuestion = prep.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / prep.questions.length) * 100

    const nextQuestion = () => {
        if (currentQuestionIndex < prep.questions.length - 1) {
            setIsRevealed(false)
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setIsRevealed(false)
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const Simulator = () => (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Question {currentQuestionIndex + 1} of {prep.questions.length}
                </span>
            </div>

            {/* Flashcard Area */}
            <div className="perspective-1000">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="relative min-h-[300px] w-full"
                    >
                        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col h-full">
                            {/* Card Header */}
                            <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    Behavioral
                                </span>
                                <button
                                    onClick={() => setIsRevealed(!isRevealed)}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    title={isRevealed ? "Hide Tips" : "Show Tips"}
                                >
                                    {isRevealed ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Card Body */}
                            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                <h3 className="text-2xl font-semibold text-foreground leading-snug mb-6">
                                    {currentQuestion}
                                </h3>

                                {isRevealed && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full text-left bg-blue-500/10 rounded-xl p-6 border border-blue-500/20"
                                    >
                                        <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center">
                                            <Award className="h-4 w-4 mr-2" />
                                            AI Coach Tip
                                        </h4>
                                        <p className="text-sm text-blue-700/80 leading-relaxed">
                                            Use the STAR method (Situation, Task, Action, Result) for this.
                                            Focus on a specific instance where you demonstrated leadership or problem-solving.
                                            Quantify your results if possible.
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Card Footer controls */}
                            <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
                                <button
                                    onClick={prevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className="p-2 rounded-full hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-muted-foreground"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>

                                <span className="text-sm font-medium text-muted-foreground/70">
                                    {isRevealed ? 'Revealed' : 'Tap eye to reveal hints'}
                                </span>

                                <button
                                    onClick={nextQuestion}
                                    disabled={currentQuestionIndex === prep.questions.length - 1}
                                    className="p-2 rounded-full hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-muted-foreground"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-bold text-foreground flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Interview Simulator
                </h3>
                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setMode('practice')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            mode === 'practice'
                                ? 'bg-background text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        Practice Mode
                    </button>
                    <button
                        onClick={() => setMode('list')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            mode === 'list'
                                ? 'bg-background text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        List View
                    </button>
                </div>
            </div>

            {mode === 'practice' ? (
                <Simulator />
            ) : (
                <ul className="space-y-3">
                    {prep.questions.map((q, i) => (
                        <li key={i} className="group bg-card p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all flex justify-between items-start">
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                                    {i + 1}
                                </span>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary pt-0.5 transition-colors">{q}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setCurrentQuestionIndex(i)
                                    setMode('practice')
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-primary hover:bg-primary/10 rounded transition-opacity"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

