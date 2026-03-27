const express = require("express")
const router = express.Router()

const therapyController = require("./therapy.controller")

const verifyToken = require("../../middleware/jwt.middleware")
const authorizeRole = require("../../middleware/role.middleware")


// AI therapy recommendations
router.get(
"/recommendations",
verifyToken,
therapyController.getTherapyRecommendations
)


// get therapy plan
router.get(
"/plan",
verifyToken,
therapyController.getTherapyPlan
)


// counselor creates therapy plan
router.post(
"/plan",
verifyToken,
authorizeRole("counselor"),
therapyController.createTherapyPlan
)

module.exports = router