-- Create resume_comparisons table
DROP TABLE IF EXISTS public.resume_comparisons CASCADE;

CREATE TABLE public.resume_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_a_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  resume_b_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.resume_comparisons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own resume comparisons" ON public.resume_comparisons;
CREATE POLICY "Users can view own resume comparisons"
  ON public.resume_comparisons FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own resume comparisons" ON public.resume_comparisons;
CREATE POLICY "Users can create own resume comparisons"
  ON public.resume_comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Index for faster lookups by user (though standard RLS usually covers this well enough)
CREATE INDEX idx_resume_comparisons_user_id ON public.resume_comparisons(user_id);
