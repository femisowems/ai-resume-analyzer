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
