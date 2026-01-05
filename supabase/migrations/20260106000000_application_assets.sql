-- Application Assets Schema Migration
-- Creates tables and types for the blueprint-based Application Assets UI

-- =====================================================
-- 1. Create Custom Types (Enums)
-- =====================================================

CREATE TYPE document_type AS ENUM ('cover_letter', 'thank_you_email', 'follow_up_email');
CREATE TYPE document_status AS ENUM ('ready', 'needs_update', 'draft', 'missing');
CREATE TYPE document_priority AS ENUM ('required', 'optional');

-- =====================================================
-- 2. Add Columns to job_applications
-- =====================================================

ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS current_resume_version_id UUID REFERENCES resume_versions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS resume_changed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assets_last_reviewed_at TIMESTAMPTZ;

-- =====================================================
-- 3. Create job_assets Table
-- =====================================================

CREATE TABLE IF NOT EXISTS job_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  resume_version_id UUID NOT NULL REFERENCES resume_versions(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  last_changed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_job_assets_job_id ON job_assets(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assets_resume_version_id ON job_assets(resume_version_id);

-- Enable RLS
ALTER TABLE job_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_assets
CREATE POLICY "Users can view their own job assets"
  ON job_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_assets.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own job assets"
  ON job_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_assets.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own job assets"
  ON job_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_assets.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own job assets"
  ON job_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_assets.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

-- =====================================================
-- 4. Create job_documents Table
-- =====================================================

CREATE TABLE IF NOT EXISTS job_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  document_type document_type NOT NULL,
  status document_status DEFAULT 'missing',
  priority document_priority DEFAULT 'required',
  generated_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  depends_on_resume_version_id UUID REFERENCES resume_versions(id) ON DELETE SET NULL,
  status_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_documents_job_id ON job_documents(job_id);
CREATE INDEX IF NOT EXISTS idx_job_documents_document_id ON job_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_job_documents_status ON job_documents(status);
CREATE INDEX IF NOT EXISTS idx_job_documents_priority ON job_documents(priority);

-- Enable RLS
ALTER TABLE job_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_documents
CREATE POLICY "Users can view their own job documents"
  ON job_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_documents.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own job documents"
  ON job_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_documents.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own job documents"
  ON job_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_documents.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own job documents"
  ON job_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = job_documents.job_id
      AND job_applications.user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. Create document_status_events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS document_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_document_id UUID NOT NULL REFERENCES job_documents(id) ON DELETE CASCADE,
  old_status document_status,
  new_status document_status NOT NULL,
  reason TEXT,
  triggered_by TEXT CHECK (triggered_by IN ('user', 'ai', 'resume_change')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_document_status_events_job_document_id ON document_status_events(job_document_id);
CREATE INDEX IF NOT EXISTS idx_document_status_events_created_at ON document_status_events(created_at DESC);

-- Enable RLS
ALTER TABLE document_status_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_status_events
CREATE POLICY "Users can view their own document status events"
  ON document_status_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_documents
      JOIN job_applications ON job_applications.id = job_documents.job_id
      WHERE job_documents.id = document_status_events.job_document_id
      AND job_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own document status events"
  ON document_status_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_documents
      JOIN job_applications ON job_applications.id = job_documents.job_id
      WHERE job_documents.id = document_status_events.job_document_id
      AND job_applications.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. Migration Helper: Populate job_assets from existing data
-- =====================================================

-- For existing jobs that have a resume_version_id, create job_assets entry
INSERT INTO job_assets (job_id, resume_version_id, locked_at, last_changed_at)
SELECT 
  id as job_id,
  resume_version_id,
  created_at as locked_at,
  updated_at as last_changed_at
FROM job_applications
WHERE resume_version_id IS NOT NULL
ON CONFLICT (job_id) DO NOTHING;

-- Update current_resume_version_id for existing jobs
UPDATE job_applications
SET current_resume_version_id = resume_version_id
WHERE resume_version_id IS NOT NULL
AND current_resume_version_id IS NULL;

-- =====================================================
-- 7. Migration Helper: Create job_documents from existing document_job_links
-- =====================================================

-- Migrate existing cover letters
INSERT INTO job_documents (
  job_id,
  document_id,
  document_type,
  status,
  priority,
  generated_at,
  last_updated_at,
  depends_on_resume_version_id
)
SELECT 
  djl.job_application_id as job_id,
  djl.document_id,
  CASE 
    WHEN d.type = 'cover_letter' THEN 'cover_letter'::document_type
    WHEN d.type = 'thank_you' THEN 'thank_you_email'::document_type
    ELSE 'follow_up_email'::document_type
  END as document_type,
  CASE 
    WHEN d.status = 'active' THEN 'ready'::document_status
    WHEN d.status = 'draft' THEN 'draft'::document_status
    ELSE 'needs_update'::document_status
  END as status,
  'required'::document_priority as priority,
  d.created_at as generated_at,
  d.created_at as last_updated_at,
  ja.current_resume_version_id as depends_on_resume_version_id
FROM document_job_links djl
JOIN documents d ON d.id = djl.document_id
JOIN job_applications ja ON ja.id = djl.job_application_id
WHERE d.type IN ('cover_letter', 'thank_you')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. Create placeholder job_documents for required documents
-- =====================================================

-- For each job without a cover letter, create a placeholder
INSERT INTO job_documents (
  job_id,
  document_id,
  document_type,
  status,
  priority,
  status_reason
)
SELECT 
  ja.id as job_id,
  NULL as document_id,
  'cover_letter'::document_type,
  'missing'::document_status,
  'required'::document_priority,
  'Cover letter not yet generated' as status_reason
FROM job_applications ja
WHERE NOT EXISTS (
  SELECT 1 FROM job_documents jd
  WHERE jd.job_id = ja.id
  AND jd.document_type = 'cover_letter'
)
ON CONFLICT DO NOTHING;
