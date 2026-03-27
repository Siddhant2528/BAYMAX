const express = require("express")
const router = express.Router()

const appointmentController =
require("./appointment.controller")

const verifyToken =
require("../../middleware/jwt.middleware")

const authorizeRole =
require("../../middleware/role.middleware")


// book appointment (student)
router.post(
"/",
verifyToken,
authorizeRole("student"),
appointmentController.bookAppointment
)


// student appointments
router.get(
"/student",
verifyToken,
authorizeRole("student"),
appointmentController.getStudentAppointments
)


// counselor appointments
router.get(
"/counselor",
verifyToken,
authorizeRole("counselor"),
appointmentController.getCounselorAppointments
)


// cancel appointment
router.delete(
"/:id",
verifyToken,
appointmentController.cancelAppointment
)


// update appointment status
router.put(
"/:id",
verifyToken,
authorizeRole("counselor"),
appointmentController.updateAppointmentStatus
)

module.exports = router