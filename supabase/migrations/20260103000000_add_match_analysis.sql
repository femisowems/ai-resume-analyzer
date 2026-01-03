-- Add match_analysis column to job_applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS match_analysis JSONB;
