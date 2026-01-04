'use server'

import { createClient } from '@/lib/supabase/server'
import { analyzeJobMatch } from '@/lib/gemini-jobs'
import { JobStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'

// ... (existing updateJobStatus and addJobActivity) ...

export async function triggerJobAnalysis(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Fetch Job and Job Description
    const { data: job } = await supabase
        .from('job_applications')
        .select(`*, resume_version:resume_versions(content)`)
        .eq('id', jobId)
        .single()

    if (!job || !job.description) {
        throw new Error('Job description missing or not found')
    }

    // 2. Resolve Resume Content
    // resume_version.content might be JSON (StructuredResumeContent). 
    // We need text. If it's structured, we might need to stringify it or use 'raw_text' property if exists.
    // Based on types.ts: StructuredResumeContent has raw_text? optional.
    // Or we just stringify the whole thing.

    const resumeContent = job.resume_version?.content
    const resumeText = resumeContent?.raw_text || JSON.stringify(resumeContent) || ""

    if (!resumeText) {
        throw new Error('Resume content missing')
    }

    // 3. Analyze
    const analysis = await analyzeJobMatch(resumeText, job.description)

    // 4. Save Result
    const { error } = await supabase
        .from('job_applications')
        .update({
            match_score: analysis.match_score,
            analysis_json: analysis,
            updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

    if (error) throw new Error('Failed to save analysis')

    revalidatePath('/dashboard/jobs')
    return analysis
}
