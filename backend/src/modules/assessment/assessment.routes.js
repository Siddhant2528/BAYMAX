const express = require("express")
const router = express.Router()

const assessmentController = require("./assessment.controller")
const verifyToken = require("../../middleware/jwt.middleware")

// get questions
router.get("/phq9", verifyToken, assessmentController.getPHQ9Questions)
router.get("/gad7", verifyToken, assessmentController.getGAD7Questions)

// submit tests
router.post("/phq9/submit", verifyToken, assessmentController.submitPHQ9)
router.post("/gad7/submit", verifyToken, assessmentController.submitGAD7)

// results
router.get("/result/:id", verifyToken, assessmentController.getResult)

// history
router.get("/history", verifyToken, assessmentController.getHistory)

module.exports = router