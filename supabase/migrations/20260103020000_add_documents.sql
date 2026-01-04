-- Documents table for AI-generated content
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('cover_letter', 'thank_you', 'linkedin')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id);
