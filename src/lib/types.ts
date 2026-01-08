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
    total: number
    breakdown: {
        ats: number
        impact: number
        keywords: number
        clarity: number
    }
    explanation: {
        ats: string[]
        impact: string[]
        keywords: string[]
        clarity: string[]
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
    type: 'impact' | 'ats' | 'clarity' | 'formatting' | 'tone' | 'general'
    severity: 'high' | 'medium' | 'low'
    section_target: 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'general'
    description: string
    proposed_fix: string
}

export type JobStatus = 'SAVED' | 'APPLIED' | 'RECRUITER_SCREEN' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'ARCHIVED';

export interface Company {
    id: string
    name: string
    domain?: string
    logo_url?: string
    brandfetch_data?: any
}

export interface Job {
    id: string
    user_id: string
    company_name: string
    company_id?: string // Foreign key to Company
    company_logo?: string // Direct URL if we have it (or from cache)
    company_logo_cache?: string // Denormalized cache field
    role: string // @deprecated use job_title
    job_title: string
    status: JobStatus
    stage_specifics?: {
        interview_round?: number
        interviewer_names?: string[]
        notes?: string
    }
    description?: string // Description is optional or loaded on demand
    job_description?: string // New dedicated column for JD text
    match_score?: number
    applied_date?: string
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
    type: 'cover_letter' | 'thank_you' | 'linkedin' | 'resume' // Resumes are separate table currently, though we might want to unify concept in UI
    title: string
    content: string
    status: 'draft' | 'active' | 'archived' | 'template'
    ai_analysis?: DocumentAnalysis
    last_used_at?: string
    reuse_count: number
    created_at: string
    links?: DocumentJobLink[]
}

// --- Job Detail Redesign Types ---

export interface JobStageHistory {
    id: string
    job_id: string
    status: JobStatus
    entered_at: string
    exited_at?: string
    duration_days?: number
}

export type ContactType = 'recruiter' | 'hiring_manager' | 'peer' | 'referral' | 'other'
export type ContactStatus = 'identified' | 'contacted' | 'replied' | 'ghosted'

export interface JobContact {
    id: string
    job_id: string
    name: string
    role?: string
    email?: string
    linkedin_url?: string
    type: ContactType
    status: ContactStatus
    last_contact_at?: string
    notes?: string
    created_at: string
}

export type TimelineEventType = 'stage_change' | 'email_sent' | 'interview_scheduled' | 'document_created' | 'note_added'

export interface JobTimelineEvent {
    id: string
    job_id: string
    event_type: TimelineEventType
    title: string
    description?: string
    metadata?: Json
    occurred_at: string
}

// Extended Job Interface for Redesign
export interface JobExtended extends Job {
    next_action_json?: {
        action: string
        reason: string
        type: 'urgent' | 'document' | 'outreach' | 'prep'
    }
    match_analysis_json?: {
        score: number
        missing_keywords: string[]
        present_keywords: string[]
        analysis_text: string
        executive_summary?: string
        strengths?: string[]
        gaps?: string[]
        verdict?: string
    }
    interview_prep_json?: {
        questions: string[]
        notes: string
    }
}

// --- Application Assets Types ---

export type DocumentType = 'cover_letter' | 'thank_you_email' | 'follow_up_email'
export type DocumentStatus = 'ready' | 'needs_update' | 'draft' | 'missing'
export type DocumentPriority = 'required' | 'optional'

export interface JobAsset {
    id: string
    job_id: string
    resume_version_id: string
    resume_version?: ResumeVersion & {
        resume?: {
            id: string
            title: string
        }
    }
    locked_at: string
    last_changed_at: string
}

export interface JobDocument {
    id: string
    job_id: string
    document_id?: string
    document?: Document
    document_type: DocumentType
    status: DocumentStatus
    priority: DocumentPriority
    generated_at?: string
    last_updated_at?: string
    depends_on_resume_version_id?: string
    status_reason?: string
    created_at: string
}

export interface DocumentStatusEvent {
    id: string
    job_document_id: string
    old_status: DocumentStatus | null
    new_status: DocumentStatus
    reason: string
    triggered_by: 'user' | 'ai' | 'resume_change'
    created_at: string
}

export interface ApplicationAssetsData {
    resume_used: JobAsset | null
    required_documents: JobDocument[]
    optional_documents: JobDocument[]
    next_actions: ContextAction[]
}

export interface ContextAction {
    id: string
    label: string
    type: 'generate' | 'regenerate' | 'review' | 'optimize'
    priority: 'primary' | 'secondary'
    document_type?: DocumentType
}
