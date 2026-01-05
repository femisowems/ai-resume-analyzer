'use client'

import { useState } from 'react'
import { JobExtended } from '@/lib/types'
import { MessageSquare, RefreshCw, ChevronRight, ChevronLeft, Eye, EyeOff, CheckCircle2, Award, Zap, BookOpen } from 'lucide-react'
import { triggerInterviewPrep } from '@/app/dashboard/jobs/actions-analysis'
import { motion, AnimatePresence } from 'framer-motion'

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
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Interview Integration Missing</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto mb-6">
                    Connect your resume to the job description to generate targeted interview questions and STAR method answers.
                </p>
                {jobId && (
                    <form action={triggerInterviewPrep.bind(null, jobId)}>
                        <button type="submit" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all">
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
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
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
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
                            {/* Card Header */}
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    Behavioral
                                </span>
                                <button
                                    onClick={() => setIsRevealed(!isRevealed)}
                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                    title={isRevealed ? "Hide Tips" : "Show Tips"}
                                >
                                    {isRevealed ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Card Body */}
                            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                <h3 className="text-2xl font-semibold text-gray-900 leading-snug mb-6">
                                    {currentQuestion}
                                </h3>

                                {isRevealed && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full text-left bg-blue-50 rounded-xl p-6 border border-blue-100"
                                    >
                                        <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center">
                                            <Award className="h-4 w-4 mr-2" />
                                            AI Coach Tip
                                        </h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Use the STAR method (Situation, Task, Action, Result) for this.
                                            Focus on a specific instance where you demonstrated leadership or problem-solving.
                                            Quantify your results if possible.
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Card Footer controls */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={prevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>

                                <span className="text-sm font-medium text-gray-400">
                                    {isRevealed ? 'Revealed' : 'Tap eye to reveal hints'}
                                </span>

                                <button
                                    onClick={nextQuestion}
                                    disabled={currentQuestionIndex === prep.questions.length - 1}
                                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
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
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                    Interview Simulator
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('practice')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'practice'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Practice Mode
                    </button>
                    <button
                        onClick={() => setMode('list')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'list'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
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
                        <li key={i} className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all flex justify-between items-start">
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium">
                                    {i + 1}
                                </span>
                                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 pt-0.5">{q}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setCurrentQuestionIndex(i)
                                    setMode('practice')
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 hover:bg-indigo-50 rounded"
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
