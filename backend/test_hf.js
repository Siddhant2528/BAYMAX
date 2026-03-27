require('dotenv').config();
const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function test() {
    console.log("API Key Status:", process.env.HUGGINGFACE_API_KEY ? "Loaded Successfully" : "MISSING FROM .ENV");
    try {
        const response = await hf.chatCompletion({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 10
        });
        console.log("Success! Response from HuggingFace:", response.choices[0].message);
    } catch (error) {
        console.error("\n--- EXACT ERROR DETAILS ---");
        console.error(error.message);
        if (error.response) {
            console.error("Status Code:", error.response.status);
            console.error("Data:", await error.response.text());
        }
        console.error("---------------------------\n");
    }
}
test();
