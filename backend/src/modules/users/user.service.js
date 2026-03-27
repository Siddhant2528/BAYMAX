const {pool} = require("../../config/db")

// Get student profile
const getProfile = async (userId) => {

    const result = await pool.query(
        `SELECT id,name,email,role,college_id,guardian_phone,department,created_at
         FROM users
         WHERE id=$1`,
        [userId]
    )

    return result.rows[0]
}


// Update student profile
const updateProfile = async (userId, data) => {

    const { name, collegeId } = data

    const result = await pool.query(
        `UPDATE users
         SET name=$1, college_id=$2
         WHERE id=$3
         RETURNING id,name,email,college_id,guardian_phone`,
        [name, collegeId, userId]
    )

    return result.rows[0]
}


// Add or update guardian contact
const updateGuardianContact = async (userId, guardianPhone) => {

    const result = await pool.query(
        `UPDATE users
         SET guardian_phone=$1
         WHERE id=$2
         RETURNING id,name,email,guardian_phone`,
        [guardianPhone, userId]
    )

    return result.rows[0]
}


// Get mental health history
const getMentalHealthHistory = async (userId) => {

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
    getProfile,
    updateProfile,
    updateGuardianContact,
    getMentalHealthHistory
}