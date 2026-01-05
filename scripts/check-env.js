console.log("Node Version:", process.version);
console.log("Fetch available:", typeof fetch !== 'undefined');

try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    console.log("SDK Loaded");
} catch (e) {
    console.log("SDK Load Error:", e.message);
}
