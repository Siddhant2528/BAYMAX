const express = require("express")
const router = express.Router()

const recommendationController =
require("./recommendation.controller")

const verifyToken =
require("../../middleware/jwt.middleware")

router.get(
"/",
verifyToken,
recommendationController.getRecommendations
)

module.exports = router