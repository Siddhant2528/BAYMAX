require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") })
const twilio = require("twilio")

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

async function main() {
    // List last 10 messages from Twilio to see all statuses
    const messages = await client.messages.list({ limit: 10 })
    
    console.log("\n═══ LAST 10 TWILIO SMS MESSAGES ═══\n")
    messages.forEach(m => {
        console.log(`To: ${m.to} | Status: ${m.status} | Error: ${m.errorCode || 'none'} | ${m.dateCreated?.toISOString()}`)
        if (m.errorMessage) console.log(`  ❌ Error: ${m.errorMessage}`)
    })
}

main().catch(e => console.error("Error:", e.message))
