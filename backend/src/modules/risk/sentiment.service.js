const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const analyzeSentiment = async(message)=>{

    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: "Analyze emotional distress level of this message. Return a number between 0 and 30. Respond only with the number, absolutely no other text."
    });

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 10 }
    });

    const score = parseInt(result.response.text().trim());

    return isNaN(score) ? 0 : score
}

module.exports = analyzeSentiment