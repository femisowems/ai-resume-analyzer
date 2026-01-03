const fs = require('fs');
const https = require('https');
const path = require('path');

// Simple dotenv parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error("Could not read .env.local");
        return {};
    }
}

const env = loadEnv();
const apiKey = env.OPENAI_API_KEY;

if (!apiKey) {
    console.error("❌ No OPENAI_API_KEY found in .env.local");
    process.exit(1);
}

console.log(`Checking API Key: ${apiKey.slice(0, 8)}...`);

const req = https.request({
    hostname: 'api.openai.com',
    path: '/v1/models',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("✅ OpenAI API Connection Successful!");
            console.log("Key is valid and has quota.");
        } else {
            console.error(`❌ API Request Failed with Status: ${res.statusCode}`);
            console.error("Response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error("❌ Request Error:", e);
});

req.end();
