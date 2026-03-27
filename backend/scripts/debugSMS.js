require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") })

const { pool } = require("../src/config/db")
const sendSMS   = require("../src/modules/notifications/sms.service")

async function debug() {

    console.log("\n══════════════════════════════════════")
    console.log("  BAYMAX SMS DEBUG TOOL")
    console.log("══════════════════════════════════════\n")

    // ── 1. Find Sagar Patil ───────────────────────────────────────
    console.log("── STEP 1: Looking up user 'Sagar Patil' ──")
    const userResult = await pool.query(
        `SELECT id, name, email, role, guardian_phone
         FROM users
         WHERE name ILIKE '%Sagar%'
         ORDER BY id DESC LIMIT 5`
    )

    if (userResult.rows.length === 0) {
        console.error("❌ No user found with name like 'Sagar'. Check the name in DB.")
        await pool.end()
        return
    }

    console.table(userResult.rows)

    const student = userResult.rows[0]
    const userId  = student.id

    console.log("\n✅ Found user:", student.name)
    console.log("   ID            :", userId)
    console.log("   guardian_phone:", student.guardian_phone || "❌ NULL / EMPTY")

    // ── 2. Check assessment results ────────────────────────────────
    console.log("\n── STEP 2: Recent assessment results for this user ──")
    const assessments = await pool.query(
        `SELECT id, test_type, score, severity, created_at
         FROM assessment_results
         WHERE student_id = $1
         ORDER BY created_at DESC LIMIT 10`,
        [userId]
    )

    if (assessments.rows.length === 0) {
        console.warn("⚠️  No assessment results found for this user.")
    } else {
        console.table(assessments.rows)
        const severe = assessments.rows.filter(r => r.severity === "severe")
        console.log(`\n   Severe results found: ${severe.length}`)
        if (severe.length === 0) {
            console.warn("⚠️  No 'severe' severity results — SMS would NOT have been triggered!")
            console.warn("   PHQ9 needs score ≥ 20, GAD7 needs score ≥ 15 to hit 'severe'")
        }
    }

    // ── 3. Test SMS directly if guardian_phone exists ───────────────
    if (student.guardian_phone) {
        console.log("\n── STEP 3: Sending direct test SMS to guardian ──")
        await sendSMS(
            student.guardian_phone,
            `🚨 BAYMAX DEBUG TEST: SMS pipeline verified for ${student.name}. Guardian alert system is working.`
        )
        console.log("   Check logs above for 📱 SMS success or ❌ error.")
    } else {
        console.error("\n── STEP 3: SKIPPED ──")
        console.error("   guardian_phone is NULL in DB for this user.")
        console.error("   Fix: UPDATE users SET guardian_phone='9081809555' WHERE id=" + userId + ";")
    }

    await pool.end()
    console.log("\n══════════════════════════════════════\n")
}

debug().catch(err => {
    console.error("Fatal debug error:", err.message)
    process.exit(1)
})
