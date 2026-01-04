import { GoogleGenerativeAI } from "@google/generative-ai";
import { Job } from "@/lib/types";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// ------------------------------------------------------------------
// 1. Strategic Briefing (For the Dashboard Header)
// ------------------------------------------------------------------

export interface StrategicBriefing {
    briefing: string;
    attention_queue: {
        job_id: string;
        reason: string;
        suggested_action: string
    }[];
}

export async function generateStrategicBriefing(jobs: Job[]): Promise<StrategicBriefing> {
    // Filter down to active jobs to save tokens
    const activeJobs = jobs
        .filter(j => j.status !== 'ARCHIVED' && j.status !== 'REJECTED')
        .map(j => ({
            id: j.id,
            company: j.company_name,
            role: j.role,
            status: j.status,
            days_in_stage: j.updated_at
                ? Math.floor((new Date().getTime() - new Date(j.updated_at).getTime()) / (1000 * 3600 * 24))
                : 0
        }));

    const prompt = `
    You are a Career Strategy AI.
    Review this active job pipeline and generate a daily briefing.

    Active Jobs Data:
    ${JSON.stringify(activeJobs)}

    Task 1: Generate a natural language "Briefing" (1-2 sentences).
    - Tone: Professional, motivating, concise.
    - Focus: Upcoming interviews (if any), then stalled applications (14+ days), then general progress.
    - Example: "You have 2 interviews this week. Focus on prep. 3 other applications are stalled."

    Task 2: Build an "Attention Queue".
    - identifying jobs that need action (stalled > 14 days, interview scheduled, offer received).
    - Reason: Why is it flagged?
    - Action: Concrete next step (e.g. "Send follow-up", "Prepare case study").

    Output JSON:
    {
      "briefing": "string",
      "attention_queue": [ 
          { "job_id": "string", "reason": "string", "suggested_action": "string" } 
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as StrategicBriefing;
    } catch (error) {
        console.error("Gemini Briefing Error:", error);
        return {
            briefing: "Welcome back. Let's make progress on your applications today.",
            attention_queue: []
        };
    }
}

// ------------------------------------------------------------------
// 2. Job Match Analysis
// ------------------------------------------------------------------

export interface JobMatchAnalysis {
    match_score: number;
    keywords_matched: string[];
    missing_keywords: string[];
    overall_fit: string;
    interview_prep_questions: string[];
}

export async function analyzeJobMatch(resumeText: string, jobDescription: string): Promise<JobMatchAnalysis> {
    const prompt = `
    You are a FAANG Recruiter.
    Analyze the match between this Resume and Job Description.

    Resume: "${resumeText.slice(0, 10000)}..."
    Job Description: "${jobDescription.slice(0, 10000)}..."

    Task:
    1. Score the match (0-100). Be strict. 70+ is good.
    2. Extract KEYWORDS from JD that are present in Resume.
    3. Extract KEYWORDS from JD that are MISSING in Resume.
    4. Provide 3 specific interview prep questions based on the gaps or key requirements.

    Output JSON:
    {
      "match_score": number, // 0-100
      "keywords_matched": ["string"],
      "missing_keywords": ["string"],
      "overall_fit": "string (Short summary, e.g. 'Strong candidate for Senior role due to...')",
      "interview_prep_questions": ["string", "string", "string"]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as JobMatchAnalysis;
    } catch (error) {
        console.error("Gemini Job Match Error:", error);
        throw new Error("Failed to analyze job match");
    }
}
