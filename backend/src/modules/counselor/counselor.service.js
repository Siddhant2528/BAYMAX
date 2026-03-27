const {pool} = require("../../config/db")

// dashboard statistics
const getDashboardStats = async(counselorId)=>{

    const totalStudents = await pool.query(
        `SELECT COUNT(*) FROM users WHERE role='student'`
    )

    const crisisStudents = await pool.query(
        `SELECT COUNT(DISTINCT student_id)
         FROM (
           SELECT DISTINCT ON (student_id, test_type) student_id, test_type, score, severity
           FROM assessment_results
           ORDER BY student_id, test_type, created_at DESC
         ) latest
         WHERE (test_type='PHQ9' AND severity='severe')
            OR (test_type='GAD7' AND severity='severe')`
    )

    const pendingRequests = await pool.query(
        `SELECT COUNT(*)
         FROM appointments
         WHERE counselor_id=$1 AND status='pending'`,
        [counselorId]
    )

    return {
        totalStudents: totalStudents.rows[0].count,
        crisisStudents: crisisStudents.rows[0].count,
        pendingRequests: pendingRequests.rows[0].count
    }

}



// get ALL students with their latest PHQ9 & GAD7 scores
const getStudents = async()=>{

    const result = await pool.query(
        `SELECT
            u.id, u.name, u.email, u.department, u.college_id,
            u.guardian_phone, u.student_contact, u.created_at,
            phq.score   AS phq9_score,
            phq.severity AS phq9_severity,
            gad.score   AS gad7_score,
            gad.severity AS gad7_severity
         FROM users u
         LEFT JOIN LATERAL (
             SELECT score, severity
             FROM assessment_results
             WHERE student_id = u.id AND test_type = 'PHQ9'
             ORDER BY created_at DESC LIMIT 1
         ) phq ON true
         LEFT JOIN LATERAL (
             SELECT score, severity
             FROM assessment_results
             WHERE student_id = u.id AND test_type = 'GAD7'
             ORDER BY created_at DESC LIMIT 1
         ) gad ON true
         WHERE u.role = 'student'
         ORDER BY u.name ASC`
    )

    return result.rows
}



// get crisis students (max severity PHQ9 or GAD7)
const getCrisisStudents = async()=>{

    const result = await pool.query(
        `SELECT DISTINCT ON (u.id)
                u.id, u.name, u.email, u.department, u.college_id, u.guardian_phone, u.student_contact, u.created_at,
                phq.score AS phq9_score, phq.severity AS phq9_severity,
                gad.score AS gad7_score, gad.severity AS gad7_severity
         FROM users u
         LEFT JOIN LATERAL (
             SELECT score, severity FROM assessment_results
             WHERE student_id = u.id AND test_type = 'PHQ9'
             ORDER BY created_at DESC LIMIT 1
         ) phq ON true
         LEFT JOIN LATERAL (
             SELECT score, severity FROM assessment_results
             WHERE student_id = u.id AND test_type = 'GAD7'
             ORDER BY created_at DESC LIMIT 1
         ) gad ON true
         WHERE u.role = 'student'
           AND (
             phq.severity = 'severe'
             OR gad.severity = 'severe'
           )
         ORDER BY u.id`
    )

    return result.rows
}



// get student profile
const getStudentProfile = async(studentId)=>{

    const result = await pool.query(
        `SELECT id, name, email, college_id, guardian_phone, student_contact, department, created_at
         FROM users
         WHERE id=$1`,
        [studentId]
    )

    return result.rows[0]
}



// student mental health history
const getStudentHistory = async(studentId)=>{

    const result = await pool.query(
        `SELECT test_type, score, severity, created_at
         FROM assessment_results
         WHERE student_id=$1
         ORDER BY created_at DESC`,
        [studentId]
    )

    return result.rows
}



// emergency alerts
const getEmergencyAlerts = async()=>{

    const result = await pool.query(
        `SELECT e.id, e.student_id, e.severity, e.detected_phrase, e.created_at,
                u.name, u.email
         FROM emergency_cases e
         JOIN users u ON u.id = e.student_id
         ORDER BY e.created_at DESC`
    )

    return result.rows
}



module.exports = {
    getDashboardStats,
    getStudents,
    getCrisisStudents,
    getStudentProfile,
    getStudentHistory,
    getEmergencyAlerts
}