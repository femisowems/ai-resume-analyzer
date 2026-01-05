-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    domain text UNIQUE,
    logo_url text,
    brandfetch_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_fetched_at timestamp with time zone
);

-- Add index on domain for fast lookups
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Update jobs table to link to companies
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS company_logo_cache text; -- Denormalized for fast list rendering

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view companies
CREATE POLICY "Authenticated users can view companies"
    ON companies FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert companies (during job creation/resolution)
CREATE POLICY "Authenticated users can insert companies"
    ON companies FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update companies (if they trigger a refresh)
CREATE POLICY "Authenticated users can update companies"
    ON companies FOR UPDATE
    USING (auth.role() = 'authenticated');
