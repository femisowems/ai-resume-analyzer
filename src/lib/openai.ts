import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisResult {
    summary: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    structured_content: {
        contact_info: string;
        summary: string;
        experience: Array<{
            role: string;
            company: string;
            duration: string;
            description: string;
        }>;
        education: Array<{
            degree: string;
            school: string;
            year: string;
        }>;
        skills: string[];
    };
}

export async function analyzeResume(text: string): Promise<AnalysisResult> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API Key is missing");
    }

    const prompt = `
    You are an expert AI Resume Intelligence System. Analyze the following resume text deeply.

    Provide a structured analysis returning strictly JSON with the following fields:
    1. "summary": A professional executive summary (3-4 sentences).
    2. "score": A competitive ATS score (0-100) based on impact, metrics, and clarity.
    3. "strengths": List of 3-5 specific strong points (e.g., "Quantifiable Impact", "Strong Action Verbs").
    4. "weaknesses": List of 3-5 specific weak points or risks (e.g., "Passive Voice", "Lack of Metrics").
    5. "improvements": List of 3-5 actionable fixes to increase interview chances.
    6. "structured_content": Parse the resume into structured sections:
       - "contact_info": string
       - "summary": string
       - "experience": array of objects { "role", "company", "duration", "description" }
       - "education": array of objects { "degree", "school", "year" }
       - "skills": array of strings

    Resume Text:
    ${text.slice(0, 15000)}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant that outputs JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("No content received from OpenAI");
        }

        const result = JSON.parse(content) as AnalysisResult;
        return result;

    } catch (error) {
        console.error("OpenAI Analysis Error:", error);
        throw new Error("Failed to analyze resume with AI");
    }
}

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

export async function compareResumes(resumeAText: string, resumeBText: string): Promise<ComparisonResult> {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API Key is missing");

    const prompt = `
    You are a Senior Recruiter comparing two resumes for a tech role.
    Compare Resume A and Resume B.

    Return JSON:
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
    ${resumeAText.slice(0, 7000)}

    Resume B:
    ${resumeBText.slice(0, 7000)}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant that outputs JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content");

        return JSON.parse(content) as ComparisonResult;
    } catch (e) {
        console.error("Comparison Error", e);
        throw new Error("Failed to compare resumes");
    }
}

export interface MatchResult {
    score: number;
    analysis: string;
    missing_keywords: string[];
}

export async function matchResumeToJob(resumeText: string, jobDescription: string): Promise<MatchResult> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API Key is missing");
    }

    const prompt = `
    You are a Hiring Manager AI. Compare the following Resume Text against the Job Description.
    
    1. Provide a Match Score (0-100) based on skills/experience alignment.
    2. Provide a brief analysis (2-3 sentences) explaining the score.
    3. List key missing keywords or skills from the resume that are in the job description.

    Return JSON:
    {
      "score": number,
      "analysis": "string",
      "missing_keywords": ["string", "string"]
    }

    Resume:
    ${resumeText.slice(0, 5000)}

    Job Description:
    ${jobDescription.slice(0, 2000)}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant that outputs JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content from OpenAI");

        return JSON.parse(content) as MatchResult;

    } catch (error) {
        console.error("OpenAI Match Error:", error);
        throw new Error("Failed to match resume");
    }
}

export interface InterviewQuestion {
    question: string;
    answer: string;
    type: 'technical' | 'behavioral';
}

export async function generateInterviewQuestions(resumeText: string, jobDescription: string): Promise<InterviewQuestion[]> {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API Key is missing");

    const prompt = `
    Based on the Resume and Job Description below, generate 5 interview questions (mixture of technical and behavioral).
    For each question, provide a suggested answer using the STAR method if applicable.

    Return JSON:
    {
        "questions": [
            { "question": "string", "answer": "string", "type": "technical" | "behavioral" }
        ]
    }

    Resume:
    ${resumeText.slice(0, 3000)}

    Job Description:
    ${jobDescription.slice(0, 1000)}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a generic interviewer." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        })

        const content = completion.choices[0].message.content
        if (!content) throw new Error("No content")

        const result = JSON.parse(content)
        return result.questions
    } catch (e) {
        console.error("Interview Gen Error", e)
        throw new Error("Failed to generate questions")
    }
}

export async function generateCoverLetter(
    resumeText: string,
    jobTitle: string,
    companyName: string,
    jobDescription: string,
    currentDateStr: string = new Date().toLocaleDateString(),
    additionalContext?: string
): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a professional career coach helping write compelling cover letters. 
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

Return ONLY the cover letter text starting with the header.`
                },
                {
                    role: "user",
                    content: `Resume:\n${resumeText}\n\nJob Title: ${jobTitle}\nCompany: ${companyName}\nJob Description:\n${jobDescription}`
                }
            ],
            temperature: 0.7,
        })

        return completion.choices[0].message.content || ""
    } catch (e) {
        console.error("Cover Letter Gen Error", e)
        throw new Error("Failed to generate cover letter")
    }
}

export async function generateThankYouEmail(
    resumeText: string,
    jobTitle: string,
    companyName: string,
    interviewerName: string,
    interviewDate: string,
    additionalContext?: string
): Promise<string> {
    try {
        const currentDateStr = new Date().toLocaleDateString()
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a professional career coach helping write post-interview thank-you emails.
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

Return ONLY the email body text.`
                },
                {
                    role: "user",
                    content: `Resume:\n${resumeText}\n\nJob Title: ${jobTitle}\nCompany: ${companyName}\nInterviewer: ${interviewerName}\nInterview Date: ${interviewDate}`
                }
            ],
            temperature: 0.7,
        })

        return completion.choices[0].message.content || ""
    } catch (e) {
        console.error("Thank You Email Gen Error", e)
        throw new Error("Failed to generate thank-you email")
    }
}

export async function optimizeLinkedIn(
    resumeText: string,
    targetRole: string
): Promise<{ headline: string; summary: string; tips: string[] }> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a LinkedIn optimization expert. Analyze the resume and suggest improvements for a LinkedIn profile.
Return a JSON object with:
{
  "headline": "A compelling 120-character headline",
  "summary": "A 3-paragraph professional summary highlighting key achievements",
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
}

Make it keyword-rich, achievement-focused, and tailored to the target role.`
                },
                {
                    role: "user",
                    content: `Resume:\n${resumeText}\n\nTarget Role: ${targetRole}`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0].message.content
        if (!content) throw new Error("No content")

        return JSON.parse(content)
    } catch (e) {
        console.error("LinkedIn Optimization Error", e)
        throw new Error("Failed to optimize LinkedIn profile")
    }
}
