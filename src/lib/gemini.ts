import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, StructuredResumeContent } from "@/lib/types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function generateWithRetry(prompt: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Failed to generate content after retries");
}

// The response from Gemini combines analysis + structured content in one JSON
export interface GeminiAnalysisResponse extends AnalysisResult {
  structured_resume: StructuredResumeContent;
}

export async function analyzeResumeWithGemini(
  resumeText: string,
  jobDescription?: string
): Promise<GeminiAnalysisResponse> {
  const prompt = `
    You are an expert Executive Resume Writer and Hiring Manager at a FAANG company.
    Analyze the following resume text ${jobDescription ? "targeting the provided Job Description" : "for a general software engineering role"}.

    **Constraint 1**: Output valid JSON only. No markdown formatting.
    **Constraint 2**: Be strict. A "perfect" score is 100, average is 50. Most resumes should be 40-70.
    **Constraint 3**: Separate experience and projects distinctly.

    Resume Text:
    """
    ${resumeText.slice(0, 25000)}
    """

    ${jobDescription ? `
    Target Job Description:
    """
    ${jobDescription.slice(0, 10000)}
    """
    ` : ''}

    Output Schema (JSON):
    {
      "overall_score": number (0-100),
      "sub_scores": {
        "ats_compatibility": number,
        "impact_metrics": number,
        "clarity": number,
        "keyword_match": number,
        "seniority_fit": number
      },
      "keywords": {
        "present": ["string"],
        "missing": ["string"] (important if Job Description is provided, else general typical skills),
        "irrelevant": ["string"]
      },
      "suggestions": [
        {
          "id": "string (uuid-like)",
          "type": "impact" | "ats" | "clarity" | "formatting" | "tone",
          "severity": "high" | "medium" | "low",
          "section_target": "summary" | "experience" | "projects" | "education" | "skills" | "general",
          "description": "string (why change this?)",
          "proposed_fix": "string (concrete example of the fix)"
        }
      ],
      "structured_resume": {
        "summary": { "content": "string" },
        "contact_info": { "content": "string" },
        "skills": { "content": "string" },
        "experience": [
            { 
              "id": "string (uuid-like)", 
              "role": "string", 
              "company": "string", 
              "duration": "string", 
              "location": "string",
              "bullets": ["string"] 
            }
        ],
        "education": [
           { "id": "string", "degree": "string", "school": "string", "year": "string" }
        ],
        "projects": [
            { "id": "string", "name": "string", "bullets": ["string"] }
        ]
      }
    }
  `;

  try {
    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown fencing
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as GeminiAnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze resume with Gemini");
  }
}

export async function suggestImprovement(
  originalText: string,
  instruction: string,
  context: 'impact' | 'tone' | 'conciseness'
): Promise<string[]> {
  const prompt = `
    You are a professional resume editor.
    Task: Rewrite the following text to match the instruction: "${instruction}".
    Focus on: ${context}.
    Provide 3 distinct options usually varying in length or style.
    
    Input Text: "${originalText}"

    Output JSON constraint:
    {
      "options": ["string", "string", "string"]
    }
  `;

  const result = await generateWithRetry(prompt);
  const text = result.response.text();
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const data = JSON.parse(cleanJson);
  return data.options;
}

export async function analyzeDocumentHealth(
  content: string,
  type: string,
  context?: string
): Promise<import("@/lib/types").DocumentAnalysis> {
  const prompt = `
    You are an expert Career Coach and Document Analyst.
    Analyze this ${type} for a job search context.
    Determine its tone, personalization depth, and reusability.

    Document Content:
    """
    ${content.slice(0, 50000)}
    """

    ${context ? `
    Context (Linked Job Description or Role):
    """
    ${context.slice(0, 10000)}
    """
    ` : ''}

    Output JSON constraint:
    {
      "tone": "formal" | "casual" | "confident" | "urgent" | "neutral",
      "personalization_score": number (0-100),
      "improvement_suggestions": ["string" (concise actionable tip)],
      "key_strengths": ["string" (what works well)]
    }
  `;

  try {
    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Document Analysis Error:", error);
    // Return a fallback so the UI doesn't break
    return {
      tone: "neutral",
      personalization_score: 50,
      improvement_suggestions: ["AI analysis failed. Please try again."],
      key_strengths: []
    };
  }
}
// ... existing imports ...
// ... existing imports ...
// import { AnalysisResult, StructuredResumeContent } from "@/lib/types";

// ... existing code ...

export interface ComparisonResult {
  summary: string;
  differences: {
    category: string;
    resume_a_notes: string;
    resume_b_notes: string;
    winner: 'A' | 'B' | 'Tie';
  }[];
  recommendation: string;
}

export async function compareResumesWithGemini(resumeAText: string, resumeBText: string): Promise<ComparisonResult> {
  const prompt = `
    You are a Senior Recruiter comparing two resumes for a tech role.
    Compare Resume A and Resume B.

    Output JSON constraint:
    {
      "summary": "Brief overview of how they compare (2 sentences).",
      "differences": [
        {
          "category": "string (e.g., Impact Metrics, Skill Coverage, Formatting)",
          "resume_a_notes": "string",
          "resume_b_notes": "string",
          "winner": "A" | "B" | "Tie"
        }
      ],
      "recommendation": "Which resume is better for a general Senior Software Engineer role and why?"
    }

    Resume A:
    """
    ${resumeAText.slice(0, 10000)}
    """

    Resume B:
    """
    ${resumeBText.slice(0, 10000)}
    """
  `;

  try {
    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Comparison Error:", error);
    throw new Error("Failed to compare resumes with Gemini");
  }
}

export interface MatchResult {
  score: number;
  analysis: string;
  missing_keywords: string[];
}

export async function matchResumeToJobWithGemini(resumeText: string, jobDescription: string): Promise<MatchResult> {
  const prompt = `
    You are a Hiring Manager AI. Compare the following Resume Text against the Job Description.
    
    1. Provide a Match Score (0-100) based on skills/experience alignment.
    2. Provide a brief analysis (2-3 sentences) explaining the score.
    3. List key missing keywords or skills from the resume that are in the job description.

    Output JSON constraint:
    {
      "score": number,
      "analysis": "string",
      "missing_keywords": ["string", "string"]
    }

    Resume:
    """
    ${resumeText.slice(0, 5000)}
    """

    Job Description:
    """
    ${jobDescription.slice(0, 5000)}
    """
  `;

  try {
    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Match Error:", error);
    throw new Error("Failed to match resume with Gemini");
  }
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  type: 'technical' | 'behavioral';
}

export async function generateInterviewQuestionsWithGemini(resumeText: string, jobDescription: string): Promise<InterviewQuestion[]> {
  const prompt = `
    Based on the Resume and Job Description below, generate 5 interview questions (mixture of technical and behavioral).
    For each question, provide a suggested answer using the STAR method if applicable.

    Output JSON constraint:
    {
        "questions": [
            { "question": "string", "answer": "string", "type": "technical" | "behavioral" }
        ]
    }

    Resume:
    """
    ${resumeText.slice(0, 5000)}
    """

    Job Description:
    """
    ${jobDescription.slice(0, 2000)}
    """
  `;

  try {
    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);
    return data.questions;
  } catch (error) {
    console.error("Gemini Interview Question Error:", error);
    throw new Error("Failed to generate interview questions with Gemini");
  }
}

export async function generateCoverLetterWithGemini(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  currentDateStr: string = new Date().toLocaleDateString(),
  additionalContext?: string
): Promise<string> {
  const prompt = `
    You are a professional career coach helping write compelling cover letters. 
    Generate a personalized, professional cover letter that:
    - **STRICTLY FOLLOW THIS HEADER FORMAT** (REPLACE bracketed text with actual data extracted from Resume. Do NOT output the brackets):
      [Candidate Name from Resume]
      [Candidate Email from Resume]
      [Candidate Phone from Resume]
      ${currentDateStr}

      [Hiring Manager Name (if unknown use 'Hiring Manager')]
      ${companyName}
      [Company Address (if unknown use 'Headquarters')]

    - **Body Content**:
      - Highlights relevant experience from the resume, specifically mentioning METRICS and ACHIEVEMENTS (e.g. "Increased revenue by 20%")
      - Shows enthusiasm for the specific role and company
      - Demonstrates understanding of the job requirements
      - Uses a professional yet warm tone
      - Is 3-4 paragraphs long
      - Avoids generic phrases
      ${additionalContext ? `- **IMPORTANT NOTE**: The candidate has provided specific notes/context for this application. You MUST incorporate the following instructions/details into the letter: "${additionalContext}"` : ''}

    Output straight text (Markdown is okay).

    Resume:
    """
    ${resumeText.slice(0, 5000)}
    """

    Job Context:
    Role: ${jobTitle}
    Company: ${companyName}
    Description: ${jobDescription.slice(0, 2000)}
  `;

  try {
    const result = await generateWithRetry(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Cover Letter Error:", error);
    throw new Error("Failed to generate cover letter with Gemini");
  }
}

export async function generateThankYouEmailWithGemini(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  interviewerName: string,
  interviewDate: string,
  additionalContext?: string
): Promise<string> {
  const currentDateStr = new Date().toLocaleDateString();
  const prompt = `
    You are a professional career coach helping write post-interview thank-you emails.
    Generate a professional, concise thank-you email that:
    - **STRICTLY FOLLOW THIS HEADER FORMAT** (REPLACE bracketed text with actual data extracted from Resume. Do NOT output the brackets):
      [Candidate Name from Resume]
      [Candidate Email from Resume]
      [Candidate Phone from Resume]
      ${currentDateStr}

      ${interviewerName}
      ${companyName}
      [Company Address (if unknown use 'Headquarters')]

    - **Body Content**:
      - Thanks the interviewer for their time
      - Reiterates interest in the position
      - Mentions a specific topic discussed (if generic, use "our conversation about the role")
      - Keeps it brief (2-3 short paragraphs)
      - Ends with a professional closing
      ${additionalContext ? `- **IMPORTANT NOTE**: The candidate has provided specific notes/context for this email. You MUST incorporate the following instructions/details: "${additionalContext}"` : ''}

    Output straight text.

    Resume: "${resumeText.slice(0, 3000)}"
    Context: Job: ${jobTitle} at ${companyName}, Interviewer: ${interviewerName}, Date: ${interviewDate}
  `;

  try {
    const result = await generateWithRetry(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Thank You Email Error:", error);
    throw new Error("Failed to generate thank you email with Gemini");
  }
}

export async function optimizeLinkedInWithGemini(
  resumeText: string,
  targetRole: string
): Promise<{ headline: string; summary: string; tips: string[] }> {
  const prompt = `
    You are a LinkedIn optimization expert. Analyze the resume and suggest improvements for a LinkedIn profile.
    
    Output JSON constraint:
    {
      "headline": "A compelling 120-character headline",
      "summary": "A 3-paragraph professional summary highlighting key achievements",
      "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
    }

    Make it keyword-rich, achievement-focused, and tailored to the target role.

    Resume:
    """
    ${resumeText.slice(0, 5000)}
    """
    Target Role: ${targetRole}
  `;

  try {
    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini LinkedIn Optimization Error:", error);
    throw new Error("Failed to optimize LinkedIn with Gemini");
  }
}

export async function rewriteResumeSectionWithGemini(
  currentText: string,
  instruction: string,
  context?: string
): Promise<string> {
  const prompt = `
    You are an expert Resume Writer and Editor.
    Your task is to rewrite a specific section or bullet point of a resume based on the user's instruction.

    Rules:
    - Improve clarity, impact, and professionalism.
    - Use strong action verbs.
    - Incorporate metrics if reasonable to infer (or use [placeholder] for user to fill).
    - If the instruction is to "add keyword X", ensure it is integrated naturally.
    - Return ONLY the rewritten text. Do not add conversational filler.

    Current Text:
    "${currentText}"

    Instruction: "${instruction}"
    ${context ? `Additional Context: ${context}` : ''}
  `;

  try {
    const result = await generateWithRetry(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Rewrite Error:", error);
    throw new Error("Failed to rewrite section with Gemini");
  }
}
