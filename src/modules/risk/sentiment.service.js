const OpenAI = require("openai")

const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
})


const analyzeSentiment = async(message)=>{

    const response = await openai.chat.completions.create({

        model:"gpt-4o-mini",

        messages:[
        {
        role:"system",
        content:"Analyze emotional distress level of this message. Return a number between 0 and 30."
        },
        {
        role:"user",
        content:message
        }
        ]

    })

    const score = parseInt(response.choices[0].message.content)

    return isNaN(score) ? 0 : score
}

module.exports = analyzeSentiment