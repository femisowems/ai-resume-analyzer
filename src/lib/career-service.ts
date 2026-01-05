import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/types'

export async function getCareerProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    return data
}

export function formatCareerContext(profile: Profile | null): string {
    if (!profile) return ''

    const roles = profile.target_roles?.length
        ? `Target Roles: ${profile.target_roles.join(', ')}`
        : ''

    const skills = profile.skills?.length
        ? `Top Skills: ${profile.skills.join(', ')}`
        : ''

    const experience = profile.experience_summary
        ? `Experience Summary: ${profile.experience_summary}`
        : ''

    const years = profile.years_of_experience
        ? `Years of Experience: ${profile.years_of_experience}`
        : ''

    // Combine non-empty strings
    return [roles, skills, years, experience].filter(Boolean).join('\n')
}
