const express = require("express")
const router = express.Router()

const chatController = require("./chat.controller")
const verifyToken = require("../../middleware/jwt.middleware")

router.post("/message", verifyToken, chatController.sendMessage)

router.get("/history", verifyToken, chatController.getHistory)

// ── Session routes ────────────────────────────────────────────────────────────
router.post("/sessions", verifyToken, chatController.createSession)

router.get("/sessions", verifyToken, chatController.listSessions)

router.get("/sessions/:sessionId/messages", verifyToken, chatController.getSessionMessages)

module.exports = router