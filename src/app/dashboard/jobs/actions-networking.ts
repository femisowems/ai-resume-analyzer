
// ------------------------------------------------------------------
// Networking Lite Actions
// ------------------------------------------------------------------

export async function addContact(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const jobId = formData.get('jobId') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const email = formData.get('email') as string
    const linkedinUrl = formData.get('linkedinUrl') as string
    const notes = formData.get('notes') as string

    if (!jobId || !name) return

    const { error } = await supabase
        .from('job_contacts')
        .insert({
            job_id: jobId,
            user_id: user.id,
            name,
            role,
            email,
            linkedin_url: linkedinUrl,
            notes
        })

    if (error) {
        console.error('Error adding contact:', error)
        throw new Error('Failed to add contact')
    }

    revalidatePath(`/dashboard/jobs/${jobId}/contacts`)
}

export async function deleteContact(formData: FormData) {
    const supabase = await createClient()
    const contactId = formData.get('contactId') as string
    const jobId = formData.get('jobId') as string // Redirect back

    if (!contactId) return

    await supabase
        .from('job_contacts')
        .delete()
        .eq('id', contactId)

    revalidatePath(`/dashboard/jobs/${jobId}/contacts`)
}
