require('dotenv').config();

async function listModels() {
    try {
        console.log("Using API Key starting with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + "..." : "EMPTY");
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("\n❌ GOOGLE API ERROR:");
            console.error(JSON.stringify(data.error, null, 2));
        } else {
            console.log("\n✅ AVAILABLE MODELS:");
            const modelNames = data.models ? data.models.map(m => m.name) : [];
            console.log(modelNames.join('\n'));
        }
    } catch(e) { 
        console.error(e) 
    }
}
listModels();
