'use server'

import { createClient } from '@/lib/supabase/server'
import { parseResumeFile } from '@/lib/parse-resume'
// import { analyzeResume } from '@/lib/openai' // Removed for Async Gemini

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadResume(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Unauthorized')
    }

    const file = formData.get('resume') as File
    if (!file) {
        throw new Error('No file provided')
    }

    const title = formData.get('title') as string || file.name

    // 2. Upload to Storage
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        throw new Error('Failed to upload file')
    }

    // 3. Parse Text
    let parsedText = ''
    try {
        parsedText = await parseResumeFile(file)
    } catch (e) {
        console.error('Parse Error:', e)
    }

    // 4. AI Analysis (Skipped for async processing)
    const aiResult = null; // Defer analysis


    // 5. Create Resume Record
    const { data: resume, error: dbError } = await supabase
        .from('resumes')
        .insert({
            user_id: user.id,
            title: title,
            raw_file_path: filePath,
        })
        .select()
        .single()

    if (dbError) {
        console.error('DB Error:', dbError)
        throw new Error('Failed to create resume record')
    }

    // 6. Create Initial Version
    const initialContent = {
        summary: parsedText.slice(0, 500) + '...',
        raw_text: parsedText,
        contact_info: '',
        skills: [],
        experience: [],
        education: [],
        projects: []
    }

    const { data: version, error: versionError } = await supabase
        .from('resume_versions')
        .insert({
            resume_id: resume.id,
            version_number: 1,
            content: initialContent,
            analysis_result: aiResult
        })
        .select()
        .single()

    if (versionError) {
        console.error('Version Error:', versionError)
        throw new Error('Failed to save version')
    }

    // 7. Update current version pointer
    await supabase
        .from('resumes')
        .update({ current_version_id: version.id })
        .eq('id', resume.id)

    revalidatePath('/dashboard')
    // redirect('/dashboard/resumes')
    return { success: true, id: resume.id }
}

// import { compareResumes } from '@/lib/openai'
import { compareResumesWithGemini } from '@/lib/gemini'

export async function compareResumesAction(resumeIdA: string, resumeIdB: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    if (resumeIdA === resumeIdB) {
        throw new Error('Cannot compare a resume to itself')
    }

    // Fetch both resumes with their CURRENT version content
    const { data: resumes } = await supabase
        .from('resumes')
        .select(`
            id, 
            title,
            current_version:resume_versions(content)
        `)
        .in('id', [resumeIdA, resumeIdB])
        .eq('user_id', user.id)

    if (!resumes || resumes.length !== 2) throw new Error('Resumes not found or you do not have permission')

    const resumeA = resumes.find(r => r.id === resumeIdA)
    const resumeB = resumes.find(r => r.id === resumeIdB)

    // Supabase returns arrays for related data by default
    const versionA = Array.isArray(resumeA?.current_version) ? resumeA?.current_version[0] : resumeA?.current_version
    const versionB = Array.isArray(resumeB?.current_version) ? resumeB?.current_version[0] : resumeB?.current_version

    const contentA = versionA?.content as any
    const contentB = versionB?.content as any

    // Fallback to raw_text if structured text is missing
    const textA = contentA?.raw_text || JSON.stringify(contentA) || ''
    const textB = contentB?.raw_text || JSON.stringify(contentB) || ''

    // Check if we have enough text
    if (textA.length < 50 || textB.length < 50) {
        throw new Error('One or more resumes do not have enough text to analyze. Please ensure they are properly parsed.')
    }

    // Call Gemini
    const result = await compareResumesWithGemini(textA, textB)

    // Save to DB
    const { error: saveError } = await supabase
        .from('resume_comparisons')
        .insert({
            user_id: user.id,
            resume_a_id: resumeIdA,
            resume_b_id: resumeIdB,
            result: result
        })

    if (saveError) {
        console.error("Failed to save comparison to DB", saveError)
        // We don't block the UI for this, but good to know
    }

    return result
}

export async function improveResumeSection(resumeId: string, sectionName: string, instruction: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get current version
    const { data: resume } = await supabase
        .from('resumes')
        .select(`id, title, current_version:resume_versions(*)`)
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single()

    if (!resume) throw new Error('Resume not found')

    const currentVersion = Array.isArray(resume.current_version) ? resume.current_version[0] : resume.current_version

    if (!currentVersion) throw new Error('No version found')

    const currentContent = currentVersion.content as any
    const sectionText = currentContent[sectionName] || currentContent.structured_content?.[sectionName]

    // Lazy import to avoid circular dep issues in some envs
    const { rewriteResumeSectionWithGemini } = await import('@/lib/gemini')

    const newText = await rewriteResumeSectionWithGemini(sectionText, instruction)

    // Update the resume content in DB
    // We need to update deeply nested JSON. Ideally use jsonb_set in SQL, but here we fetch-modify-save given we have the full object.

    const updatedContent = { ...currentContent, [sectionName]: newText }
    // If it was nested in structured_content, try that too
    if (currentContent.structured_content) {
        updatedContent.structured_content = { ...currentContent.structured_content, [sectionName]: newText }
    }

    // Save new version
    const { data: newVersion, error: saveError } = await supabase
        .from('resume_versions')
        .insert({
            resume_id: resume.id,
            version_number: (currentVersion.version_number || 1) + 1,
            content: updatedContent,
            analysis_result: currentVersion.analysis_result // Keep old analysis until re-run
        })
        .select()
        .single()

    if (saveError) throw new Error('Failed to save improved version')

    // Update pointer
    await supabase
        .from('resumes')
        .update({ current_version_id: newVersion.id })
        .eq('id', resume.id)

    revalidatePath(`/dashboard/resumes/${resumeId}`)
    return { success: true, newText }
}

import { analyzeResumeWithGemini } from '@/lib/gemini'

export async function analyzeResumeAction(resumeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Fetch Resume & Current Version
    const { data: resume } = await supabase
        .from('resumes')
        .select(`
            id, 
            current_version:resume_versions(*)
        `)
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single()

    if (!resume) throw new Error('Resume not found')

    const currentVersion = Array.isArray(resume.current_version) ? resume.current_version[0] : resume.current_version
    if (!currentVersion) throw new Error('No content to analyze')

    const content = currentVersion.content as any
    // Prefer raw_text if available, otherwise try to reconstruct or use summary
    const textToAnalyze = content.raw_text || JSON.stringify(content)

    if (!textToAnalyze || textToAnalyze.length < 50) {
        throw new Error('Not enough text to analyze')
    }

    try {
        // 2. Call Gemini
        const aiResult = await analyzeResumeWithGemini(textToAnalyze)

        // 3. Update the Version with Analysis Result
        // We do NOT create a new version, we enrich the current one because it was just created/uploaded
        // OR we can create a new version if we want to preserve "Raw" state. 
        // Let's update in place for the "Initial Upload" flow.

        // Merge structured content if Gemini provides it better
        const updatedContent = {
            ...content,
            // If we didn't have structured data, use Gemini's
            summary: aiResult.structured_resume?.summary?.content || content.summary,
            skills: aiResult.structured_resume?.skills?.content ? { content: aiResult.structured_resume.skills.content } : content.skills,
        }

        const { error: updateError } = await supabase
            .from('resume_versions')
            .update({
                analysis_result: aiResult,
                content: updatedContent
            })
            .eq('id', currentVersion.id)

        if (updateError) throw updateError

        revalidatePath('/dashboard/resumes')
        revalidatePath(`/dashboard/resumes/${resumeId}`)

        return { success: true }
    } catch (e) {
        console.error("Gemini Analysis Failed", e)
        throw new Error("Analysis failed")
    }
}
