-- 1. Add status tracking columns
ALTER TABLE public.resume_versions 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending';

ALTER TABLE public.resume_versions
ADD COLUMN IF NOT EXISTS analysis_error TEXT;

-- 2. Backfill existing data
-- Mark versions with results as 'completed'
UPDATE public.resume_versions 
SET status = 'completed' 
WHERE analysis_result IS NOT NULL;

-- Mark everything else as 'pending'
UPDATE public.resume_versions 
SET status = 'pending' 
WHERE analysis_result IS NULL AND status IS NULL;

-- 3. Update the RPC function to return status info
-- Dropping to ensure clean slate for return type
DROP FUNCTION IF EXISTS get_resume_stats(uuid);

CREATE OR REPLACE FUNCTION get_resume_stats(userid uuid)
RETURNS TABLE (
  id uuid,
  title text,
  created_at timestamptz,
  current_version_number int,
  applications_count bigint,
  interview_count bigint,
  ats_score_avg numeric,
  top_strengths jsonb,
  analysis_status text,
  analysis_error text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH resume_apps AS (
    SELECT 
      r.id AS r_id,
      r.title AS r_title,
      r.created_at AS r_created_at,
      COALESCE(rv.version_number, 1) AS version_number,
      -- Rename inside CTE to avoid ambiguity with output params
      COALESCE(rv.status, 'pending') AS raw_status,
      rv.analysis_error AS raw_error,
      
      -- Support new 'keywords.present' or old 'strengths'
      COALESCE(
        rv.analysis_result->'keywords'->'present',
        rv.analysis_result->'strengths', 
        '[]'::jsonb
      ) AS strengths,
      -- Support new 'total', old 'overall_score', or older 'score'
      COALESCE(
        (rv.analysis_result->>'total')::numeric,
        (rv.analysis_result->>'overall_score')::numeric,
        (rv.analysis_result->>'score')::numeric,
        0
      ) AS base_score,
      ja.status,
      ja.match_score
    FROM resumes r
    LEFT JOIN resume_versions rv ON r.current_version_id = rv.id
    LEFT JOIN resume_versions all_rv ON all_rv.resume_id = r.id
    LEFT JOIN job_applications ja ON ja.resume_version_id = all_rv.id
    WHERE r.user_id = userid
  )
  SELECT
    r_id AS id,
    r_title AS title,
    r_created_at AS created_at,
    MAX(version_number)::int AS current_version_number,
    COUNT(status) AS applications_count,
    COUNT(CASE WHEN status ILIKE ANY (ARRAY['%interview%', '%offer%', '%hired%']) THEN 1 END) AS interview_count,
    COALESCE(
        NULLIF(AVG(match_score), 0), 
        MAX(base_score)
    ) AS ats_score_avg,
    strengths AS top_strengths,
    -- Map raw columns to output columns here
    raw_status AS analysis_status,
    raw_error AS analysis_error
  FROM resume_apps
  GROUP BY r_id, r_title, r_created_at, strengths, raw_status, raw_error;
END;
$$;
