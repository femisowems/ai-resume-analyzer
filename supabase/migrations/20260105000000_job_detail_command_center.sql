-- Up Migration

-- Add new JSONB columns to job_applications if they don't exist
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS next_action_json JSONB,
ADD COLUMN IF NOT EXISTS match_analysis_json JSONB,
ADD COLUMN IF NOT EXISTS interview_prep_json JSONB;

-- Create job_stage_history table
CREATE TABLE IF NOT EXISTS job_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  duration_days INT
);

-- Enable RLS for job_stage_history
ALTER TABLE job_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job history"
  ON job_stage_history FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM job_applications WHERE id = job_id));

CREATE POLICY "Users can insert their own job history"
  ON job_stage_history FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM job_applications WHERE id = job_id));

-- Create job_contacts table
CREATE TABLE IF NOT EXISTS job_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  linkedin_url TEXT,
  type TEXT CHECK (type IN ('recruiter', 'hiring_manager', 'peer', 'referral', 'other')),
  status TEXT CHECK (status IN ('identified', 'contacted', 'replied', 'ghosted')),
  last_contact_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for job_contacts
ALTER TABLE job_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job contacts"
  ON job_contacts FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM job_applications WHERE id = job_id));

CREATE POLICY "Users can manage their own job contacts"
  ON job_contacts FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM job_applications WHERE id = job_id));


-- Create job_timeline_events table
CREATE TABLE IF NOT EXISTS job_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'stage_change', 'email_sent', 'interview_scheduled', 'document_created'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for job_timeline_events
ALTER TABLE job_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job timeline"
  ON job_timeline_events FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM job_applications WHERE id = job_id));

CREATE POLICY "Users can insert their own job timeline"
  ON job_timeline_events FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM job_applications WHERE id = job_id));
