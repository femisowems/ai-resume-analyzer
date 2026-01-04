import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisResult {
    summary: string;
    score: number;
    improvements: string[];
}

export async function analyzeResume(text: string): Promise<AnalysisResult> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API Key is missing");
    }

    const prompt = `
    You are an expert AI Resume Analyzer. Analyze the following resume text and provide:
    1. A professional summary (max 3-4 sentences).
    2. A score from 0-100 based on impact, clarity, and skills (be strict but fair).
    3. A list of 3-5 specific improvements to make the resume better.

    Return the result strictly as a JSON object with the following structure:
    {
      "summary": "string",
      "score": number,
      "improvements": ["string", "string"]
    }

    Resume Text:
    ${text.slice(0, 10000)} -- truncate to avoid token limits if necessary
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
    jobDescription: string
): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a professional career coach helping write compelling cover letters. 
Generate a personalized, professional cover letter that:
- **Use the Candidate's Details**: Extract the candidate's Name, Email, and Phone directly from the provided Resume text. Use these for the header and sign-off.
- Highlights relevant experience from the resume
- Shows enthusiasm for the specific role and company
- Demonstrates understanding of the job requirements
- Uses a professional yet warm tone
- Is 3-4 paragraphs long
- Avoids generic phrases

Return ONLY the cover letter text. Start with the header (Name/Contact) if possible, or standard business letter format.`
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
    interviewDate: string
): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a professional career coach helping write post-interview thank-you emails.
Generate a professional, concise thank-you email that:
- **Sign-off**: Sign off with the candidate's full name extracted from the Resume.
- Thanks the interviewer for their time
- Reiterates interest in the position
- Mentions a specific topic discussed (if generic, use "our conversation about the role")
- Keeps it brief (2-3 short paragraphs)
- Ends with a professional closing

Return ONLY the email body text, no subject line, no additional formatting.`
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
