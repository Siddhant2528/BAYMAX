require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") })

// Use the SAME sms.service.js as the real system (normalization included)
const sendSMS = require("../src/modules/notifications/sms.service")

// ─────────────────────────────────────────────
// Guardian's verified Twilio number
// ─────────────────────────────────────────────
const GUARDIAN_PHONE = "9081809555"   // auto-normalized to +919081809555

const TWILIO_SID        = process.env.TWILIO_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE      = process.env.TWILIO_PHONE

async function testSMS() {

    console.log("─────────────────────────────────")
    console.log("🔍 Twilio Config Check")
    console.log("─────────────────────────────────")
    console.log("SID        :", TWILIO_SID        ? `${TWILIO_SID.slice(0,6)}...` : "❌ MISSING")
    console.log("Auth Token :", TWILIO_AUTH_TOKEN ? `${TWILIO_AUTH_TOKEN.slice(0,6)}...` : "❌ MISSING")
    console.log("From Phone :", TWILIO_PHONE      || "❌ MISSING")
    console.log("To Phone   :", GUARDIAN_PHONE, "→ will normalize to +91" + GUARDIAN_PHONE)
    console.log("─────────────────────────────────")

    if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
        console.error("\n❌ One or more Twilio env variables are missing. Check your .env file.")
        process.exit(1)
    }

    const testMessage =
        "🚨 BAYMAX TEST ALERT: Testing SMS alert for mental health monitoring system. " +
        "PHQ9/GAD7 severity = SEVERE. Twilio is configured correctly!"

    console.log("\n📤 Sending test SMS via sms.service.js...")

    await sendSMS(GUARDIAN_PHONE, testMessage)

    console.log("\n✅ Test complete. Check the logs above for SMS status.")
}

testSMS()

