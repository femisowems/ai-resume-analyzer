'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Adds a single keyword to the Skills section of the resume.
 */
export async function addSkillToResume(resumeId: string, skill: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Fetch current version
    const { data: resume } = await supabase
        .from('resumes')
        .select(`
            current_version_id,
            resume_versions!resumes_current_version_id_fkey(id, content)
        `)
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single()

    if (!resume || !resume.current_version_id || !resume.resume_versions) {
        throw new Error('Resume or version not found')
    }

    // Handle array or single object response quirk
    const currentVersion: any = Array.isArray(resume.resume_versions)
        ? resume.resume_versions[0]
        : resume.resume_versions

    const content = currentVersion.content
    let newSkills = ''

    // 2. Append skill
    if (typeof content.skills === 'string') {
        newSkills = content.skills + `, ${skill}`
    } else if (content.skills && content.skills.content) {
        // StructuredResumeContent format
        newSkills = content.skills.content + `, ${skill}`
    } else {
        newSkills = skill
    }

    // 3. Update DB
    const newContent = {
        ...content,
        skills: {
            ...content.skills,
            content: newSkills
        }
    }

    const { error } = await supabase
        .from('resume_versions')
        .update({ content: newContent, created_at: new Date().toISOString() }) // In a real app, maybe create NEW version? For now, update in place for speed.
        .eq('id', resume.current_version_id)

    if (error) {
        console.error('Update error:', error)
        throw new Error('Failed to update resume')
    }

    revalidatePath(`/dashboard/resumes/${resumeId}`)
}
