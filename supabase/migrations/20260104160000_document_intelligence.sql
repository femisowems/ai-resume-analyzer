-- Create document_job_links table for many-to-many relationship
CREATE TABLE IF NOT EXISTS document_job_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    job_application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, job_application_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_job_links_document_id ON document_job_links(document_id);
CREATE INDEX IF NOT EXISTS idx_document_job_links_job_application_id ON document_job_links(job_application_id);

-- Alter documents table to add intelligence and lifecycle columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'status') THEN
        ALTER TABLE documents ADD COLUMN status TEXT DEFAULT 'draft'; -- 'draft', 'active', 'archived', 'template'
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'ai_analysis') THEN
        ALTER TABLE documents ADD COLUMN ai_analysis JSONB DEFAULT '{}'; -- Stores tone, score, summary
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'last_used_at') THEN
        ALTER TABLE documents ADD COLUMN last_used_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'reuse_count') THEN
        ALTER TABLE documents ADD COLUMN reuse_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Migrate existing job_application_id data to new link table
INSERT INTO document_job_links (document_id, job_application_id)
SELECT id, job_application_id
FROM documents
WHERE job_application_id IS NOT NULL
ON CONFLICT (document_id, job_application_id) DO NOTHING;

-- Enable RLS on new table
ALTER TABLE document_job_links ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for document_job_links
-- Users can view links if they own the document
CREATE POLICY "Users can view links for their documents"
    ON document_job_links FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_job_links.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- Users can create links if they own the document
CREATE POLICY "Users can create links for their documents"
    ON document_job_links FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_job_links.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- Users can delete links if they own the document
CREATE POLICY "Users can delete links for their documents"
    ON document_job_links FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_job_links.document_id
            AND documents.user_id = auth.uid()
        )
    );
