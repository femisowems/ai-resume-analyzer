const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let currKey = process.env.GEMINI_API_KEY;

if (!currKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
    if (match) {
        currKey = match[1];
    }
}

if (!currKey) {
    console.error("No GEMINI_API_KEY found in environment or .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(currKey);

async function listModels() {
    console.log("Testing model availability for key: " + currKey.substring(0, 5) + "...");

    const modelsToTest = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-pro"
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`\nTesting ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            const response = await result.response;
            console.log(`✅ ${modelName} SUCCESS:`, response.text().substring(0, 50));
        } catch (e) {
            console.log(`❌ ${modelName} FAILED:`, e.message.split('\n')[0]);
        }
    }
}

listModels();
