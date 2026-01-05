export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Profile {
    id: string
    email: string
    full_name: string | null
    subscription_tier: string
    target_roles?: string[]
    skills?: string[]
    experience_summary?: string
    linkedin_url?: string
    portfolio_url?: string
    years_of_experience?: number
    created_at: string
}

export interface Resume {
    id: string
    user_id: string
    title: string
    raw_file_path: string
    created_at: string
    updated_at: string
    current_version_id?: string
}

export interface ResumeVersion {
    id: string
    resume_id: string
    version_number: number
    content: StructuredResumeContent
    analysis_result: AnalysisResult
    created_at: string
}

// The structured content of the resume (editable)
export interface StructuredResumeContent {
    raw_text?: string // Fallback
    summary: {
        content: string
        feedback?: string[]
    }
    contact_info: {
        content: string
    }
    skills: {
        content: string // stored as comma separated or raw text block usually, or list
        list?: string[]
    }
    experience: ExperienceItem[]
    education: EducationItem[]
    projects: ProjectItem[]
    custom_sections?: CustomSection[]
}

export interface ExperienceItem {
    id: string
    role: string
    company: string;
    duration: string;
    location?: string;
    bullets: string[];
}

export interface EducationItem {
    id: string
    degree: string
    school: string
    year: string
}

export interface ProjectItem {
    id: string
    name: string
    bullets: string[]
}

export interface CustomSection {
    id: string
    title: string
    content: string
}

// The AI Analysis Result (Score + Suggestions)
export interface AnalysisResult {
    overall_score: number
    sub_scores: {
        ats_compatibility: number
        impact_metrics: number
        clarity: number
        keyword_match: number
        seniority_fit: number
    }
    keywords: {
        present: string[]
        missing: string[]
        irrelevant: string[]
    }
    suggestions: Suggestion[]
}

export interface Suggestion {
    id: string
    type: 'impact' | 'ats' | 'clarity' | 'formatting' | 'tone'
    severity: 'high' | 'medium' | 'low'
    section_target: 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'general'
    description: string
    proposed_fix: string
}

export type JobStatus = 'SAVED' | 'APPLIED' | 'RECRUITER_SCREEN' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'ARCHIVED';

export interface Job {
    id: string
    user_id: string
    company_name: string
    company_logo?: string
    role: string
    status: JobStatus
    stage_specifics?: {
        interview_round?: number
        interviewer_names?: string[]
        notes?: string
    }
    description?: string // Description is optional or loaded on demand
    match_score?: number
    last_contact_date?: string
    next_action_date?: string
    resume_version_id?: string
    resume_version?: {
        resume: {
            title: string
        }
    }
    analysis_json?: {
        keywords_matched: string[]
        missing_keywords: string[]
        overall_fit: string
    }
    created_at: string
    updated_at: string
}

export interface JobActivity {
    id: string
    job_id: string
    user_id: string
    type: 'NOTE' | 'STATUS_CHANGE' | 'EMAIL_SENT' | 'INTERVIEW'
    content: string
    metadata?: Json
    created_at: string
}

// --- Document Intelligence Types ---

export interface DocumentAnalysis {
    tone: 'formal' | 'casual' | 'confident' | 'urgent' | 'neutral'
    personalization_score: number // 0-100
    improvement_suggestions: string[]
    key_strengths: string[]
}

export interface DocumentJobLink {
    id: string
    document_id: string
    job_application_id: string
    created_at: string
    // Joined fields
    job_application?: {
        company_name: string
        role: string // Mapped from job_title in DB usually, but DB has job_title
        status: JobStatus
    }
}

export interface Document {
    id: string
    user_id: string
    type: 'cover_letter' | 'thank_you' | 'linkedin' // Resumes are separate table currently, though we might want to unify concept in UI
    title: string
    content: string
    status: 'draft' | 'active' | 'archived' | 'template'
    ai_analysis?: DocumentAnalysis
    last_used_at?: string
    reuse_count: number
    created_at: string
    links?: DocumentJobLink[]
}
