const { pool } = require("../../config/db")
const nodemailer = require("nodemailer")
const sendSMS = require("./sms.service") 

// email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})


// ---------------------------
// Save notification
// ---------------------------
const saveNotification = async (userId, type, message) => {

    await pool.query(
        `INSERT INTO notifications (user_id,type,message)
         VALUES($1,$2,$3)`,
        [userId, type, message]
    )
}


// ---------------------------
// Send Email
// ---------------------------
const sendEmail = async (email, subject, message) => {

    try {

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message
        })

        console.log("📧 Email sent to:", email)

    } catch (error) {
        console.error("Email error:", error.message)
    }
}


// ---------------------------
//  CRITICAL ALERT (EMAIL + SMS)
// ---------------------------
const sendCriticalAlert = async ({ userId, email, guardianPhone, message }) => {

    const alertMessage =
        `🚨 URGENT ALERT: Your ward may be at high mental health risk.\n\nMessage: ${message}\n\nPlease take immediate action.`

    try {

        // 1️⃣ Email
        if (email) {
            await sendEmail(email, "🚨 CRITICAL MENTAL HEALTH ALERT", alertMessage)
        }

        // 2️⃣ SMS to guardian
        if (guardianPhone) {
            await sendSMS(guardianPhone, alertMessage)
        }

        // 3️⃣ Save notification
        await saveNotification(userId, "critical", alertMessage)

        console.log("🚨 Critical alert sent (Email + SMS)")

        return true

    } catch (error) {

        console.error("Critical alert error:", error.message)
        return false
    }
}


// ---------------------------
// Emergency notification (existing)
// ---------------------------
const sendEmergencyNotification = async (data) => {

    const { userId, email, message } = data

    await sendEmail(
        email,
        "Emergency Mental Health Alert",
        message
    )

    await saveNotification(userId, "emergency", message)

    return true
}


// ---------------------------
// Appointment reminder
// ---------------------------
const sendAppointmentReminder = async (data) => {

    const { userId, email, appointmentDate } = data

    const message =
        `Reminder: You have a counseling appointment scheduled on ${appointmentDate}.`

    await sendEmail(
        email,
        "Appointment Reminder",
        message
    )

    await saveNotification(userId, "appointment", message)

    return true
}


// ---------------------------
// Therapy reminder
// ---------------------------
const sendTherapyReminder = async (data) => {

    const { userId, email, therapyType } = data

    const message =
        `Reminder: Your therapy session (${therapyType}) is scheduled soon.`

    await sendEmail(
        email,
        "Therapy Reminder",
        message
    )

    await saveNotification(userId, "therapy", message)

    return true
}


// ---------------------------
// Get notification history
// ---------------------------
const getNotifications = async (userId) => {

    const result = await pool.query(
        `SELECT *
         FROM notifications
         WHERE user_id=$1
         ORDER BY created_at DESC`,
        [userId]
    )

    return result.rows
}


module.exports = {
    sendEmergencyNotification,
    sendAppointmentReminder,
    sendTherapyReminder,
    getNotifications,
    sendCriticalAlert
}