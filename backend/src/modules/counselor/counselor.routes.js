const express = require("express")
const router = express.Router()

const counselorController =
require("./counselor.controller")

const verifyToken =
require("../../middleware/jwt.middleware")

const authorizeRole =
require("../../middleware/role.middleware")



// dashboard overview
router.get(
"/dashboard",
verifyToken,
authorizeRole("counselor"),
counselorController.getDashboard
)



// all students list
router.get(
"/students",
verifyToken,
authorizeRole("counselor"),
counselorController.getStudents
)



// crisis students (max severity)
router.get(
"/crisis-students",
verifyToken,
authorizeRole("counselor"),
counselorController.getCrisisStudents
)



// student profile
router.get(
"/student/:id",
verifyToken,
authorizeRole("counselor"),
counselorController.getStudentProfile
)



// student mental health history
router.get(
"/student/:id/history",
verifyToken,
authorizeRole("counselor"),
counselorController.getStudentHistory
)



// emergency alerts
router.get(
"/emergency",
verifyToken,
authorizeRole("counselor"),
counselorController.getEmergencyAlerts
)



module.exports = router