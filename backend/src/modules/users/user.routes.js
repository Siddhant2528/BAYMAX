const express = require("express")
const router = express.Router()

const userController = require("./user.controller")
const verifyToken = require("../../middleware/jwt.middleware")

// get profile
router.get("/profile", verifyToken, userController.getProfile)

// update profile
router.put("/profile", verifyToken, userController.updateProfile)

// add guardian contact
router.post("/guardian", verifyToken, userController.addGuardianContact)

// mental health history
router.get("/history", verifyToken, userController.getMentalHealthHistory)

module.exports = router