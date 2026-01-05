
import { SupabaseClient } from '@supabase/supabase-js'
import { fetchBrand, extractDomain, getBestLogoUrl } from '@/lib/brandfetch'

/**
 * Resolves a company by name or domain, fetching from Brandfetch if needed,
 * and links it to a job application.
 */
export async function resolveAndLinkCompany(
    supabase: SupabaseClient,
    jobId: string,
    companyName: string,
    jobUrl?: string
) {
    if (!companyName) return null

    // 1. Check if company exists in DB
    const { data: existingCompanies } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', companyName)
        .limit(1)

    let company = existingCompanies?.[0]

    // 2. If no company, we need to resolve it
    if (!company) {
        let domain = jobUrl ? extractDomain(jobUrl) : null

        if (!domain) {
            // Heuristic: try to guess domain or let simple name match happen later if we had a search API
            domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
        }

        // Fetch from Brandfetch
        const brandData = await fetchBrand(domain)

        // Prepare company record
        const logoUrl = brandData ? getBestLogoUrl(brandData) : null

        // Insert new company
        const { data: newCompany, error: insertError } = await supabase
            .from('companies')
            .insert({
                name: companyName, // distinct name
                domain: brandData?.domain || domain,
                logo_url: logoUrl,
                brandfetch_data: brandData || {},
                last_fetched_at: new Date().toISOString()
            })
            .select()
            .single()

        if (insertError) {
            // Handle race condition: if it was inserted by another request just now
            if (insertError.code === '23505') { // unique violation
                const { data: retryCompany } = await supabase
                    .from('companies')
                    .select('*')
                    .ilike('name', companyName)
                    .single()
                company = retryCompany
            } else {
                console.error('Failed to insert company', insertError)
                return null
            }
        } else {
            company = newCompany
        }
    }

    // 3. Link Job
    // Only update if we have a company and it's not already linked (or we want to update cache)
    if (company && jobId) {
        const { error: updateError } = await supabase
            .from('job_applications')
            .update({
                company_id: company.id,
                company_logo_cache: company.logo_url
            })
            .eq('id', jobId)

        if (updateError) {
            console.error('Failed to link job to company', updateError)
        }
    }

    return company
}
