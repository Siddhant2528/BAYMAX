const chatService = require("./chat.service")


const sendMessage = async(req,res)=>{

    try{

        const userId = req.user.userId
        const { message } = req.body

        const reply = await chatService.sendMessage(userId,message)

        res.json({
            reply
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



const getHistory = async(req,res)=>{

    try{

        const userId = req.user.userId

        const history = await chatService.getChatHistory(userId)

        res.json({
            data:history
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// ── Session endpoints ────────────────────────────────────────────────────────

const createSession = async (req, res) => {
    try {
        const userId = req.user.userId
        const session = await chatService.createSession(userId)
        res.json({ data: session })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const listSessions = async (req, res) => {
    try {
        const userId = req.user.userId
        const sessions = await chatService.getSessions(userId)
        res.json({ data: sessions })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getSessionMessages = async (req, res) => {
    try {
        const userId = req.user.userId
        const { sessionId } = req.params
        const messages = await chatService.getSessionMessages(userId, sessionId)
        res.json({ data: messages })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


module.exports = {
    sendMessage,
    getHistory,
    createSession,
    listSessions,
    getSessionMessages
}