import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { generateQuestions } from '../../actions'
import { RefreshCw } from 'lucide-react'

export default async function JobInterviewPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    const { data: job } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!job) {
        notFound()
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
                <form>
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Interview Coach 🎤</h3>
                        <p className="text-gray-500">
                            Prepare for this specific role with AI-generated questions based on the job description.
                        </p>
                    </div>

                    {!job.interview_questions ? (
                        <div className="bg-purple-50 rounded-lg p-10 text-center border-2 border-dashed border-purple-200">
                            <p className="text-purple-800 mb-6 text-lg">
                                No interview questions generated yet.
                            </p>
                            <button
                                formAction={async () => {
                                    'use server'
                                    await generateQuestions(job.id)
                                }}
                                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-sm font-medium"
                            >
                                Generate Interview Questions
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-6">
                                {(job.interview_questions as any).map((q: any, i: number) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${q.type === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {q.type}
                                            </span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-4 text-lg">{q.question}</h4>

                                        <details className="group">
                                            <summary className="flex cursor-pointer items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                                <span>Show Suggested Answer</span>
                                            </summary>
                                            <div className="mt-3 text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-200 text-base leading-relaxed">
                                                {q.answer}
                                            </div>
                                        </details>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button
                                    formAction={async () => {
                                        'use server'
                                        await generateQuestions(job.id)
                                    }}
                                    className="text-purple-600 hover:text-purple-800 hover:underline flex items-center bg-transparent font-medium"
                                >
                                    <RefreshCw className="h-5 w-5 mr-2" />
                                    Regenerate Questions
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
