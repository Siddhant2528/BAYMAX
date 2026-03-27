const express = require("express")
const router = express.Router()

const notificationController =
require("./notification.controller")

const verifyToken =
require("../../middleware/jwt.middleware")



// emergency alert
router.post(
"/emergency",
verifyToken,
notificationController.sendEmergencyNotification
)


// appointment reminder
router.post(
"/appointment",
verifyToken,
notificationController.sendAppointmentReminder
)


// therapy reminder
router.post(
"/therapy",
verifyToken,
notificationController.sendTherapyReminder
)


// get notification history
router.get(
"/",
verifyToken,
notificationController.getNotifications
)

module.exports = router