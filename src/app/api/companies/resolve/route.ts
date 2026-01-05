
import { createClient } from '@/lib/supabase/server';
import { resolveAndLinkCompany } from '@/lib/companies';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, companyName, jobUrl } = body;

    if (!companyName && !jobId) {
        return NextResponse.json({ error: 'Missing companyName or jobId' }, { status: 400 });
    }

    let targetCompanyName = companyName;
    let targetJobUrl = jobUrl;

    // If only jobId provided, fetch details
    if (jobId && !targetCompanyName) {
        const { data: job } = await supabase
            .from('job_applications')
            .select('company_name, description')
            .eq('id', jobId)
            .single();

        if (job) {
            targetCompanyName = job.company_name;
            // Try to extract URL from description if we really wanted to, but skipping for safety
        } else {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
    }

    if (!targetCompanyName) {
        return NextResponse.json({ error: 'Could not determine company name' }, { status: 400 });
    }

    try {
        const company = await resolveAndLinkCompany(supabase, jobId, targetCompanyName, targetJobUrl);

        return NextResponse.json({
            company,
            logo_url: company?.logo_url || null
        });
    } catch (e) {
        console.error('Resolution error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
