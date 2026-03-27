require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") })

const { pool } = require("../src/config/db")

async function resetAssessments() {
    const studentId = "cfd8214b-3367-47bc-83ac-9106249220de" // Sagar Patil

    const result = await pool.query(
        `DELETE FROM assessment_results WHERE student_id = $1`,
        [studentId]
    )

    console.log(`✅ Deleted ${result.rowCount} assessment result(s) for Sagar Patil.`)
    console.log("   He can now retake PHQ9 & GAD7 via the app — SMS will trigger automatically.")
    await pool.end()
}

resetAssessments().catch(err => {
    console.error("Error:", err.message)
    process.exit(1)
})
