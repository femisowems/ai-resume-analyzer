import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { analyzeJobMatch } from '../../actions'

export default async function JobMatchPage({ params }: { params: Promise<{ id: string }> }) {
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                            Job Fit Analysis
                            {job.match_score && (
                                <span className={`ml-3 px-3 py-1 text-sm rounded-full ${job.match_score >= 80 ? 'bg-green-100 text-green-800' :
                                    job.match_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    Match Score: {job.match_score}/100
                                </span>
                            )}
                        </h3>
                        <p className="text-gray-500">
                            Understand how your resume stacks up against this role.
                        </p>
                    </div>

                    {!job.match_analysis ? (
                        <div className="bg-gray-50 rounded-lg p-10 text-center border-2 border-dashed border-gray-300">
                            <p className="text-gray-500 mb-4 text-lg">
                                No analysis run yet.
                            </p>
                            <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
                                AI will compare your linked resume with the job description/notes to find gaps.
                            </p>
                            <button
                                formAction={async () => {
                                    'use server'
                                    await analyzeJobMatch(job.id)
                                }}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                            >
                                Analyze Match with AI
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
                                <h4 className="font-bold text-indigo-900 mb-3 text-lg">AI Analysis</h4>
                                <p className="text-indigo-800 leading-relaxed whitespace-pre-wrap">
                                    {(job.match_analysis as any).analysis}
                                </p>
                            </div>

                            {(job.match_analysis as any).missing_keywords?.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                                    <h4 className="font-bold text-red-900 mb-3 text-lg">Missing Keywords / Skills</h4>
                                    <p className="text-red-700 text-sm mb-4">You might be qualified, but your resume is missing these terms:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(job.match_analysis as any).missing_keywords.map((kw: string, i: number) => (
                                            <span key={i} className="bg-white text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-green-50 border border-green-100 rounded-lg p-6">
                                <h4 className="font-bold text-green-900 mb-3 text-lg">Matched Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(job.match_analysis as any).keywords_matched?.map((kw: string, i: number) => (
                                        <span key={i} className="bg-white text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                                            {kw}
                                        </span>
                                    )) || <span className="text-gray-500 text-sm">No specific matches found.</span>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button
                                    formAction={async () => {
                                        'use server'
                                        await analyzeJobMatch(job.id)
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center bg-transparent font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                    Re-analyze Match
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
