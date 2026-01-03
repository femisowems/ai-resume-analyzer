-- Add interview_questions column to job_applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS interview_questions JSONB;
