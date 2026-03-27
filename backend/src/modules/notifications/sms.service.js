const twilio = require("twilio")

const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
)

// Normalize phone number to E.164 format (+91XXXXXXXXXX for India)
const normalizePhone = (phone) => {
    if (!phone) return null
    const digits = phone.replace(/\D/g, "") // strip non-digits
    if (digits.length === 10) return `+91${digits}`           // 10-digit → +91
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}` // 91XXXXXXXXXX → +91
    if (phone.startsWith("+")) return phone                    // already E.164
    return `+${digits}`
}

const sendSMS = async (to, message) => {

    const normalizedTo = normalizePhone(to)

    if (!normalizedTo) {
        console.error("SMS error: invalid or missing phone number")
        return
    }

    try {

        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,
            to: normalizedTo
        })

        console.log(`📱 SMS sent to ${normalizedTo} | SID: ${response.sid} | Status: ${response.status}`)

    } catch (error) {

        console.error(`❌ SMS FAILED to ${normalizedTo}:`, error.message)

        if (error.code === 21608) {
            console.error(`🔴 TWILIO TRIAL LIMIT: The number ${normalizedTo} is not verified.`)
            console.error(`   ➡️  Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified`)
            console.error(`   ➡️  Add ${normalizedTo} as a Verified Caller ID to receive SMS.`)
        } else if (error.code === 21211) {
            console.error(`🔴 INVALID PHONE: ${normalizedTo} is not a valid phone number.`)
        } else {
            console.error(`🔴 Twilio Error Code: ${error.code}`)
        }

    }
}

module.exports = sendSMS