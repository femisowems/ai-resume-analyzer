-- Drop the restrictive lowercase constraint
ALTER TABLE "public"."job_applications" DROP CONSTRAINT IF EXISTS "job_applications_status_check";

-- Add new constraint allowing Uppercase and new statuses
-- We allow both cases to be safe during migration, but prefer Uppercase
ALTER TABLE "public"."job_applications" 
ADD CONSTRAINT "job_applications_status_check" 
CHECK (status IN (
    'SAVED', 'APPLIED', 'RECRUITER_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED',
    'saved', 'applied', 'recruiter_screen', 'interview', 'offer', 'rejected', 'archived'
));
