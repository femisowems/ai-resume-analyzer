'use server'

import { createClient } from '@/lib/supabase/server'
import { parseResumeFile } from '@/lib/parse-resume'
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

    // 4. Create Resume Record
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

    // 5. Create Initial Version
    const initialContent = {
        summary: parsedText.slice(0, 500) + '...',
        raw_text: parsedText,
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
            content: initialContent
        })
        .select()
        .single()

    if (versionError) {
        console.error('Version Error:', versionError)
        throw new Error('Failed to save version')
    }

    // 6. Update current version pointer
    await supabase
        .from('resumes')
        .update({ current_version_id: version.id })
        .eq('id', resume.id)

    revalidatePath('/dashboard')
    // redirect('/dashboard/resumes')
    return { success: true, id: resume.id }
}
