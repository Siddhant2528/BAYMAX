const express = require("express")
const router = express.Router()

const chatController = require("./chat.controller")
const verifyToken = require("../../middleware/jwt.middleware")

router.post("/message",verifyToken,chatController.sendMessage)

router.get("/history",verifyToken,chatController.getHistory)

module.exports = router