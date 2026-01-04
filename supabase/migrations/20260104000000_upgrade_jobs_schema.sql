-- Upgrade job_applications table
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS stage_specifics jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS match_score integer,
ADD COLUMN IF NOT EXISTS last_contact_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_action_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS analysis_json jsonb;

-- Create job_activities table for timeline
CREATE TABLE IF NOT EXISTS job_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid REFERENCES job_applications(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    content text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_activities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own job activities"
    ON job_activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job activities"
    ON job_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job activities"
    ON job_activities FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job activities"
    ON job_activities FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_job_activities_job_id ON job_activities(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status ON job_applications(user_id, status);
