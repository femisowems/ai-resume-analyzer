-- Update get_resume_stats to support new analysis_result schema (total instead of score/overall_score)
DROP FUNCTION IF EXISTS get_resume_stats(uuid);

create or replace function get_resume_stats(userid uuid)
returns table (
  id uuid,
  title text,
  created_at timestamptz,
  current_version_number int,
  applications_count bigint,
  interview_count bigint,
  ats_score_avg numeric,
  top_strengths jsonb
) 
language plpgsql
security definer
as $$
begin
  return query
  with resume_apps as (
    select 
      r.id as r_id,
      r.title as r_title,
      r.created_at as r_created_at,
      coalesce(rv.version_number, 1) as version_number,
      -- Support new 'keywords.present' or old 'strengths'
      coalesce(
        rv.analysis_result->'keywords'->'present',
        rv.analysis_result->'strengths', 
        '[]'::jsonb
      ) as strengths,
      -- Support new 'total', old 'overall_score', or older 'score'
      coalesce(
        (rv.analysis_result->>'total')::numeric,
        (rv.analysis_result->>'overall_score')::numeric,
        (rv.analysis_result->>'score')::numeric,
        0
      ) as base_score,
      ja.status,
      ja.match_score
    from resumes r
    left join resume_versions rv on r.current_version_id = rv.id
    left join resume_versions all_rv on all_rv.resume_id = r.id
    left join job_applications ja on ja.resume_version_id = all_rv.id
    where r.user_id = userid
  )
  select
    r_id as id,
    r_title as title,
    r_created_at as created_at,
    max(version_number)::int as current_version_number,
    count(status) as applications_count,
    count(case when status ilike any (array['%interview%', '%offer%', '%hired%']) then 1 end) as interview_count,
    coalesce(
        nullif(avg(match_score), 0), 
        max(base_score)
    ) as ats_score_avg,
    strengths as top_strengths
  from resume_apps
  group by r_id, r_title, r_created_at, strengths;
end;
$$;
