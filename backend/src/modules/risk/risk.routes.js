const express = require("express")
const router = express.Router()

const riskController = require("./risk.controller")
const verifyToken = require("../../middleware/jwt.middleware")

router.get("/score",verifyToken,riskController.getRiskScore)

module.exports = router