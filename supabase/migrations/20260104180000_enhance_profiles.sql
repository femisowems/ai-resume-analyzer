-- Add career fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS target_roles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_summary TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

-- Comment on columns
COMMENT ON COLUMN public.profiles.target_roles IS 'List of job titles the user is targeting';
COMMENT ON COLUMN public.profiles.skills IS 'List of top technical skills for AI context';
COMMENT ON COLUMN public.profiles.experience_summary IS 'Short bio or summary of experience for AI context';
