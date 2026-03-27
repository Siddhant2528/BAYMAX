const OpenAI = require("openai")
const ChatMessage = require("./chat.model")
const detectSelfHarm = require("./selfHarmDetector")
const {pool} = require("../../config/db")

const openai = new OpenAI({
    apiKey : process.env.OPENAI_API_KEY
})


const sendMessage = async(userId,message)=>{

    // save user message
    await ChatMessage.create({
        userId,
        role:"user",
        message
    })


    // get conversation history
    const history = await ChatMessage.find({userId})
        .sort({createdAt:1})
        .limit(10)


    const messages = history.map(m=>({
        role:m.role,
        content:m.message
    }))


    // OpenAI system prompt
    messages.unshift({
        role:"system",
        content:"You are Baymax, a calm mental health assistant helping students manage anxiety, depression and stress."
    })


    // call OpenAI
    const completion = await openai.chat.completions.create({

        model:"gpt-4o-mini",

        messages
    })


    const aiReply = completion.choices[0].message.content


    // save AI reply
    await ChatMessage.create({
        userId,
        role:"assistant",
        message:aiReply
    })


    // detect suicide risk
    const riskDetected = detectSelfHarm(message)

    if(riskDetected){

        await triggerEmergency(userId,message)

    }


    return aiReply
}



const triggerEmergency = async(userId,message)=>{

    await pool.query(

        `INSERT INTO emergency_cases
         (student_id,detected_phrase,severity)
         VALUES($1,$2,$3)`,

        [userId,message,"HIGH"]

    )

}



const getChatHistory = async(userId)=>{

    const history = await ChatMessage.find({userId})
        .sort({createdAt:1})

    return history
}



module.exports = {
    sendMessage,
    getChatHistory
}