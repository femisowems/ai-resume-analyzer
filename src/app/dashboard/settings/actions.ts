'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const fullName = formData.get('fullName') as string
    const targetRoles = (formData.get('targetRoles') as string || '').split(',').map(s => s.trim()).filter(Boolean)
    const skills = (formData.get('skills') as string || '').split(',').map(s => s.trim()).filter(Boolean)
    const experienceSummary = formData.get('experienceSummary') as string
    const linkedinUrl = formData.get('linkedinUrl') as string
    const portfolioUrl = formData.get('portfolioUrl') as string
    const yearsOfExperience = parseInt(formData.get('yearsOfExperience') as string) || null

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            target_roles: targetRoles,
            skills: skills,
            experience_summary: experienceSummary,
            linkedin_url: linkedinUrl,
            portfolio_url: portfolioUrl,
            years_of_experience: yearsOfExperience,
        })
        .eq('id', user.id)

    if (error) {
        console.error('Profile update error:', error)
        throw new Error('Failed to update profile')
    }

    revalidatePath('/dashboard/settings')
}
