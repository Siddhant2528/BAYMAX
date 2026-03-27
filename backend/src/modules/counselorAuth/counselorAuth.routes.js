const express = require("express")
const router = express.Router()

const counselorAuthController = require("./counselorAuth.controller")

router.post("/login", counselorAuthController.loginCounselor)

module.exports = router