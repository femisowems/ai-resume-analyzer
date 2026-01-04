-- Drop potentially ambiguous policy
DROP POLICY IF EXISTS "Users can CRUD own documents" ON public.documents;

-- Create explicit policies
CREATE POLICY "Users can insert own documents"
ON public.documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own documents"
ON public.documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
ON public.documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON public.documents FOR DELETE
USING (auth.uid() = user_id);
