-- Safely add columns if they don't exist

DO $$
BEGIN
    -- 1. job_application_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'documents' AND column_name = 'job_application_id'
    ) THEN
        ALTER TABLE documents ADD COLUMN job_application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE;
    END IF;

    -- 2. type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'documents' AND column_name = 'type'
    ) THEN
        ALTER TABLE documents ADD COLUMN type TEXT CHECK (type IN ('cover_letter', 'thank_you', 'linkedin'));
    END IF;

    -- 3. metadata
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'documents' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE documents ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- 4. Ensure RLS is enabled
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

END;
$$;

-- Re-apply policies to be safe (idempotent-ish)
DROP POLICY IF EXISTS "Users can CRUD own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can select own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

CREATE POLICY "Users can CRUD own documents"
ON public.documents FOR ALL
USING (auth.uid() = user_id);
