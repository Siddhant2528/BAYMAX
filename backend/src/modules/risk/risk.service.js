const { pool } = require("../../config/db")
const ChatMessage = require("../chatbot/chat.model")

const analyzeSentiment = require("./sentiment.service")
const detectKeywordRisk = require("./keywordDetector")

// 🔥 NEW: import notification service
const notificationService = require("../notifications/notification.service")

const calculateRiskScore = async (userId) => {
    try {

        // ---------------------------
        // Fetch PHQ9 score
        // ---------------------------
        const phq = await pool.query(
            `SELECT score FROM assessment_results
             WHERE student_id=$1 AND test_type='PHQ9'
             ORDER BY created_at DESC LIMIT 1`,
            [userId]
        )

        // ---------------------------
        // Fetch GAD7 score
        // ---------------------------
        const gad = await pool.query(
            `SELECT score FROM assessment_results
             WHERE student_id=$1 AND test_type='GAD7'
             ORDER BY created_at DESC LIMIT 1`,
            [userId]
        )

        const phqScore = phq.rows[0]?.score || 0
        const gadScore = gad.rows[0]?.score || 0


        // ---------------------------
        // Latest chat message
        // ---------------------------
        const lastMessage = await ChatMessage.findOne({ userId })
            .sort({ createdAt: -1 })

        let sentimentScore = 0
        let keywordScore = 0

        if (lastMessage) {
            sentimentScore = await analyzeSentiment(lastMessage.message)
            keywordScore = detectKeywordRisk(lastMessage.message)
        }


        // ---------------------------
        // Total Risk Calculation
        // ---------------------------
        const totalRisk = phqScore + gadScore + sentimentScore + keywordScore

        let riskLevel = "LOW"

        if (totalRisk >= 70)
            riskLevel = "CRITICAL"
        else if (totalRisk >= 40)
            riskLevel = "HIGH"
        else if (totalRisk >= 20)
            riskLevel = "MODERATE"


        // ---------------------------
        // 🚨 CRITICAL ALERT HANDLING
        // ---------------------------
        if (riskLevel === "CRITICAL") {

            console.log("🚨 CRITICAL RISK DETECTED for user:", userId)

            // 1️⃣ Save emergency case
            await pool.query(
                `INSERT INTO emergency_cases(student_id, severity)
                 VALUES($1, $2)`,
                [userId, "CRITICAL"]
            )

            // 2️⃣ Fetch user email + guardian phone
            const userResult = await pool.query(
                `SELECT email, guardian_phone FROM users WHERE id=$1`,
                [userId]
            )

            const user = userResult.rows[0]

            if (user) {

                const { email, guardian_phone } = user

                // 3️⃣ Trigger multi-channel alert
                await notificationService.sendCriticalAlert({
                    userId,
                    email,
                    guardianPhone: guardian_phone,
                    message: lastMessage?.message || "High risk detected"
                })

            } else {
                console.warn("⚠️ User not found for alert:", userId)
            }
        }


        // ---------------------------
        // Return response
        // ---------------------------
        return {
            phqScore,
            gadScore,
            sentimentScore,
            keywordScore,
            totalRisk,
            riskLevel
        }

    } catch (error) {

        console.error("Error calculating risk score:", error)
        throw error
    }
}

module.exports = {
    calculateRiskScore
}