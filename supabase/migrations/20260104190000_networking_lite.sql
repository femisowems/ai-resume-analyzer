-- Create job_contacts table
CREATE TABLE public.job_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    linkedin_url TEXT,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_contacts ENABLE ROW LEVEL SECURITY;

-- Create Policy
CREATE POLICY "Users can CRUD own job contacts" 
    ON public.job_contacts 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_job_contacts_job_id ON public.job_contacts(job_id);
