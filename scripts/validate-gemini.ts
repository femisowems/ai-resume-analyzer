import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
    if (match) {
        process.env.GEMINI_API_KEY = match[1];
    }
}

const MODEL_NAME = "gemini-2.5-flash";

async function validateGemini() {
    console.log("🔍 Validating Gemini Configuration...");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing in environment variables.");
        process.exit(1);
    }

    console.log("✅ API Key found.");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        console.log(`🤖 Testing Model: ${MODEL_NAME}...`);
        const result = await model.generateContent("Hello, strictly respond with 'OK'.");
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Model Response: ${text.trim()}`);
        console.log("🎉 Gemini Integration is Fully Functional!");
    } catch (error: any) {
        console.error(`❌ Validation Failed for model ${MODEL_NAME}:`);
        console.error(`   Error Message: ${error.message}`);

        if (error.message.includes("404")) {
            console.error("   Reason: 404 Not Found. This likely means the model name is incorrect or not supported by your API key/tier.");
        }
        process.exit(1);
    }
}

validateGemini();
