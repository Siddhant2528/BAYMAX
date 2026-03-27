const {pool} = require("../../config/db")

// dashboard statistics
const getDashboardStats = async(counselorId)=>{

    const totalStudents = await pool.query(
        `SELECT COUNT(DISTINCT student_id)
         FROM appointments
         WHERE counselor_id=$1`,
        [counselorId]
    )

    const emergencyCases = await pool.query(
        `SELECT COUNT(*)
         FROM emergency_cases
         WHERE severity IN ('HIGH','CRITICAL')`
    )

    const todayAppointments = await pool.query(
        `SELECT COUNT(*)
         FROM appointments
         WHERE counselor_id=$1
         AND DATE(appointment_date)=CURRENT_DATE`,
        [counselorId]
    )

    return {
        totalStudents: totalStudents.rows[0].count,
        emergencyCases: emergencyCases.rows[0].count,
        appointmentsToday: todayAppointments.rows[0].count
    }

}



// get students list
const getStudents = async(counselorId)=>{

    const result = await pool.query(

        `SELECT DISTINCT u.id,u.name,u.email
         FROM users u
         JOIN appointments a
         ON u.id = a.student_id
         WHERE a.counselor_id=$1`,

        [counselorId]

    )

    return result.rows
}



// get student profile
const getStudentProfile = async(studentId)=>{

    const result = await pool.query(

        `SELECT id,name,email,college_id,guardian_phone
         FROM users
         WHERE id=$1`,

        [studentId]

    )

    return result.rows[0]
}



// student mental health history
const getStudentHistory = async(studentId)=>{

    const result = await pool.query(

        `SELECT test_type,score,severity,created_at
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

        `SELECT e.id,e.student_id,e.severity,e.detected_phrase,e.created_at,
                u.name,u.email
         FROM emergency_cases e
         JOIN users u ON u.id = e.student_id
         ORDER BY e.created_at DESC`

    )

    return result.rows
}



module.exports = {
    getDashboardStats,
    getStudents,
    getStudentProfile,
    getStudentHistory,
    getEmergencyAlerts
}