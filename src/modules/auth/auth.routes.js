const express = require("express")
const router = express.Router()

const authController = require("./auth.controller")
const verifyToken = require("../../middleware/jwt.middleware")

router.post("/signup", authController.signup)

router.post("/login", authController.login)

router.get("/me", verifyToken, authController.getMe)

router.post("/logout", verifyToken, authController.logout)

module.exports = router