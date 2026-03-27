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
const sendCriticalAlert = async ({ userId, email, guardianPhone, message, smsMessage }) => {

    try {

        // 1️⃣ Email (if provided) — send full message
        if (email) {
            await sendEmail(email, "🚨 CRITICAL MENTAL HEALTH ALERT", message)
        }

        // 2️⃣ SMS to guardian — use short smsMessage if provided (avoids Twilio trial 30044 error)
        //    Twilio trial accounts block multi-segment SMS (>160 chars). Keep SMS short.
        if (guardianPhone) {
            await sendSMS(guardianPhone, smsMessage || message)
        }

        // 3️⃣ Save full notification in DB (shown as in-app notification)
        await saveNotification(userId, "critical", message)

        console.log("🚨 Critical alert sent (SMS to guardian)")

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


// ---------------------------
// Appointment Confirmation (Counselor)
// ---------------------------
const sendAppointmentConfirmation = async (counselorEmail, counselorPhone, studentName, appointmentDate) => {
    const message = `Hello Counselor,\n\nA new appointment has been booked by Student: ${studentName}.\nTime: ${appointmentDate}\n\nPlease check your Counselor Dashboard for details.`;
    
    // Email Notification
    if (counselorEmail) {
        await sendEmail(counselorEmail, "New Appointment Booking Received", message);
    }
    
    // SMS Notification (assuming Twilio is configured)
    if (counselorPhone) {
        await sendSMS(counselorPhone, message);
    }
    return true;
}

// ---------------------------
// Appointment Confirmation (Student)
// ---------------------------
const sendAppointmentConfirmedToStudent = async (studentEmail, appointmentDate) => {
    const formattedDate = new Date(appointmentDate).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    
    const message = `Great news!\n\nYour appointment with the counselor is confirmed on ${formattedDate}.\n\nPlease ensure you are available at that time.`;
    
    if (studentEmail) {
        await sendEmail(studentEmail, "Appointment Confirmed by Counselor", message);
    }
    return true;
}

module.exports = {
    sendEmergencyNotification,
    sendAppointmentReminder,
    sendTherapyReminder,
    getNotifications,
    sendCriticalAlert,
    sendAppointmentConfirmation,
    sendAppointmentConfirmedToStudent
}