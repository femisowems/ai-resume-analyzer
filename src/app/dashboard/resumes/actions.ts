'use server'

import { createClient } from '@/lib/supabase/server'
import { parseResumeFile } from '@/lib/parse-resume'
import { analyzeResume } from '@/lib/openai'
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

    // 4. AI Analysis
    let aiResult = null;
    try {
        if (parsedText) {
            aiResult = await analyzeResume(parsedText);
        }
    } catch (e) {
        console.error("AI Analysis Error:", e);
    }

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
        summary: aiResult?.structured_content?.summary || aiResult?.summary || parsedText.slice(0, 500) + '...',
        raw_text: parsedText,
        contact_info: aiResult?.structured_content?.contact_info || '',
        skills: aiResult?.structured_content?.skills || [],
        experience: aiResult?.structured_content?.experience || [],
        education: aiResult?.structured_content?.education || [],
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

import { compareResumes } from '@/lib/openai'

export async function compareResumesAction(resumeIdA: string, resumeIdB: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

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

    if (!resumes || resumes.length !== 2) throw new Error('Resumes not found')

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

    return await compareResumes(textA, textB)
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

    // If section doesn't exist, we might be creating it, or it's an error.
    // For now, let's assume valid sections. "structured_content" usually isn't in 'content' root unless we flattened it.
    // In uploadResume we flattened it:
    // const initialContent = { summary, ...skills, experience... }

    // So currentContent[sectionName] should work for 'experience', 'summary', etc.

    // TODO: Implement actual AI call for rewriting.
    // For now, we'll just mock it or throw.
    // detailed AI implementation for SINGLE SECTION improvement is next.
    throw new Error('AI Section Improvement not yet implemented in openai.ts')
}
