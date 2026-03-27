const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    sessionId: {
        type: String,
        required: true,
        index: true           // fast lookup by session
    },

    role: {
        type: String,
        enum: ["user", "assistant"]
    },

    message: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("ChatMessage", chatSchema)