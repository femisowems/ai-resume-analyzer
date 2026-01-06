
import fs from 'fs';
import path from 'path';

// Manually load env vars since dotenv might not be installed
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Basic quote removal
            process.env[key] = value;
        }
    });
} else {
    console.warn("⚠️ No .env.local found");
}

const DUMMY_RESUME = `
John Doe
Software Engineer
Experience:
- Senior Engineer at TechCorp (2020-Present): Led team of 5, migrated to React, improved perf by 50%.
- Junior Dev at StartupInc (2018-2020): Built landing pages, defined API schemas.
Skills: TypeScript, React, Node.js, SQL.
Education: BS CS, University of Tech.
`;

const DUMMY_JOB = `
We are looking for a Senior Software Engineer.
Requirements:
- 5+ years experience.
- Expert in React and TypeScript.
- Leadership experience.
`;

async function main() {
    console.log("🚀 Starting AI Integration Tests with Gemini-2.5-Flash (via scripts/test-ai-integration.ts)...\n");

    try {
        // Dynamic import to ensure env is loaded before key check
        const { analyzeResumeWithGemini, generateCoverLetterWithGemini, matchResumeToJobWithGemini } = await import('../src/lib/gemini');

        console.log("1️⃣ Testing comparison/match...");
        const matchResult = await matchResumeToJobWithGemini(DUMMY_RESUME, DUMMY_JOB);
        console.log("Match Score:", matchResult.score);
        if (typeof matchResult.score !== 'number') throw new Error("Score matches schema");
        console.log("✅ Match Test Passed\n");

        console.log("2️⃣ Testing Resume Analysis...");
        const analysis = await analyzeResumeWithGemini(DUMMY_RESUME, DUMMY_JOB);
        console.log("Analysis Total Score:", analysis.total);
        if (analysis.structured_resume?.summary?.content) {
            console.log("Structured Resume Summary:", analysis.structured_resume.summary.content.substring(0, 50) + "...");
        } else {
            console.log("Structured Resume Summary: MISSING");
        }

        if (!analysis.total || !analysis.structured_resume) throw new Error("Analysis schema mismatch/missing data");
        console.log("✅ Analysis Test Passed\n");

        console.log("3️⃣ Testing Cover Letter Generation...");
        const letter = await generateCoverLetterWithGemini(DUMMY_RESUME, "Senior Engineer", "TechCorp", DUMMY_JOB);
        console.log("Letter Length:", letter.length);
        if (letter.length < 100) throw new Error("Letter too short");
        console.log("✅ Cover Letter Test Passed\n");

        console.log("🎉 All AI Tests Passed!");
    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

main();
