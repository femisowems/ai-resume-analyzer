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
