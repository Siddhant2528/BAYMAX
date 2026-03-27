const {pool} = require("../../config/db")
const { sendCriticalAlert } = require("../notifications/notification.service")

// Only MAXIMUM severity triggers guardian SMS alert
const HIGH_RISK_SEVERITIES = new Set(["severe"])

// calculate severity
const calculateSeverity = (score, type) => {

    if(type === "PHQ9"){

        if(score <= 4) return "minimal"
        if(score <= 9) return "mild"
        if(score <= 14) return "moderate"
        if(score <= 19) return "moderately_severe"
        return "severe"

    }

    if(type === "GAD7"){

        if(score <= 4) return "minimal"
        if(score <= 9) return "mild"
        if(score <= 14) return "moderate"
        return "severe"
    }
}


// calculate total score
const calculateScore = (answers) => {

    return answers.reduce((sum,value)=> sum + value , 0)
}


// ── Guardian SMS alert helper ─────────────────────────────────────────────────
const sendGuardianSMSAlert = async (userId, type, score, severity) => {

    try {

        console.log(`📲 [SMS] Checking guardian alert for userId=${userId}, ${type}, severity=${severity}`)

        const studentQuery = await pool.query(
            `SELECT name, guardian_phone FROM users WHERE id=$1`,
            [userId]
        )

        if (studentQuery.rows.length === 0) {
            console.warn(`[SMS] ❌ No user found for userId=${userId}`)
            return
        }

        const { name: studentName, guardian_phone: guardianPhone } = studentQuery.rows[0]

        console.log(`[SMS] Student: ${studentName}, guardian_phone: ${guardianPhone || "NULL"}`)

        if (!guardianPhone) {
            console.warn(`[SMS] ⚠️  No guardian_phone for ${studentName} — skipping SMS`)
            return
        }

        const severityLabel = severity.replace("_", " ").toUpperCase()

        // Full message — saved in DB, shown as in-app notification
        const alertMessage =
            `🚨 BAYMAX ALERT: ${studentName}'s mental health screening result is HIGH RISK.\n\n` +
            `Test: ${type}\n` +
            `Score: ${score}\n` +
            `Severity: ${severityLabel}\n\n` +
            `Please reach out to ${studentName} immediately and connect them with a mental health professional.`

        // Short SMS — must be under 160 chars to avoid Twilio trial error 30044 (multi-segment block)
        const smsMessage =
            `BAYMAX ALERT: ${studentName} scored ${score} (${severityLabel}) on ${type}. ` +
            `Please check in with them immediately.`

        await sendCriticalAlert({
            userId,
            email:         null,
            guardianPhone: guardianPhone,
            message:       alertMessage,
            smsMessage:    smsMessage
        })

        console.log(`🚨 [SMS] Guardian alert SENT for ${studentName} (${type}: ${severityLabel})`)

    } catch (err) {
        console.error(`[SMS] ❌ Guardian alert FAILED for userId=${userId}:`, err.message)
        console.error(err)
    }
}


// submit assessment
const submitAssessment = async (userId, type, answers) => {

    const recent = await pool.query(
        `SELECT created_at FROM assessment_results
         WHERE student_id=$1 AND test_type=$2
         ORDER BY created_at DESC LIMIT 1`,
         [userId, type]
    )

    if (recent.rows.length > 0) {
        const lastTaken = new Date(recent.rows[0].created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (lastTaken > sevenDaysAgo) {
            throw new Error(`You have already taken the ${type} assessment in the last 7 days. Please wait until next week to try again.`);
        }
    }

    const score    = calculateScore(answers)
    const severity = calculateSeverity(score, type)

    const result = await pool.query(

        `INSERT INTO assessment_results
        (student_id,test_type,score,severity)
        VALUES($1,$2,$3,$4)
        RETURNING *`,

        [userId, type, score, severity]
    )

    const savedResult = result.rows[0]

    // ── Trigger guardian SMS for severe results (non-blocking) ────────────────
    if (HIGH_RISK_SEVERITIES.has(severity)) {
        sendGuardianSMSAlert(userId, type, score, severity)
            .catch(err => console.error("[SMS] Unhandled error in guardian alert:", err.message))
    }

    return savedResult
}



// get result by id
const getAssessmentResult = async (id) => {

    const result = await pool.query(

        `SELECT id,test_type,score,severity,created_at
         FROM assessment_results
         WHERE id=$1`,

        [id]
    )

    return result.rows[0]
}


// get user assessment history
const getAssessmentHistory = async (userId) => {

    const result = await pool.query(

        `SELECT id,test_type,score,severity,created_at
         FROM assessment_results
         WHERE student_id=$1
         ORDER BY created_at DESC`,

        [userId]
    )

    return result.rows
}


module.exports = {
    submitAssessment,
    getAssessmentResult,
    getAssessmentHistory
}