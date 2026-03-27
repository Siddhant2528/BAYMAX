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


module.exports = {
    sendMessage,
    getHistory
}