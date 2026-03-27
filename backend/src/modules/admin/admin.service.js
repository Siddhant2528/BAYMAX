const {pool} = require("../../config/db")
const bcrypt = require("bcrypt")


// add counselor
const addCounselor = async(data)=>{

    const { name,email,password,collegeId } = data

    const hashedPassword = await bcrypt.hash(password,10)

    const result = await pool.query(

        `INSERT INTO users
        (name,email,password,role,college_id)
        VALUES($1,$2,$3,'counselor',$4)
        RETURNING id,name,email,role,college_id,created_at`,

        [name,email,hashedPassword,collegeId]

    )

    return result.rows[0]
}


// remove counselor
const removeCounselor = async(id)=>{

    const result = await pool.query(

        `DELETE FROM users
         WHERE id=$1 AND role='counselor'
         RETURNING id,name,email`,

        [id]

    )

    if (result.rows.length === 0)
        throw new Error("Counselor not found")

    return result.rows[0]
}


// get all students (role = student)
const getAllUsers = async()=>{

    const result = await pool.query(

        `SELECT id,name,email,role,is_blocked,college_id,department,created_at
         FROM users
         WHERE role='student'
         ORDER BY created_at DESC`

    )

    return result.rows
}


// get all counselors
const getAllCounselors = async()=>{

    const result = await pool.query(

        `SELECT id,name,email,role,college_id,created_at
         FROM users
         WHERE role='counselor'
         ORDER BY created_at DESC`

    )

    return result.rows
}


// block user
const blockUser = async(userId)=>{

    const result = await pool.query(

        `UPDATE users
         SET is_blocked=true
         WHERE id=$1
         RETURNING id,name,email,is_blocked`,

        [userId]

    )

    return result.rows[0]
}


// unblock user
const unblockUser = async(userId)=>{

    const result = await pool.query(

        `UPDATE users
         SET is_blocked=false
         WHERE id=$1
         RETURNING id,name,email,is_blocked`,

        [userId]

    )

    return result.rows[0]
}
// get analytics
const getAnalyticsData = async()=>{

    // Roles Count
    const rolesRes = await pool.query(`SELECT role, COUNT(*) as count FROM users GROUP BY role`);
    
    // Appointments Count
    const appointmentsRes = await pool.query(`SELECT status, COUNT(*) as count FROM appointments GROUP BY status`);
    
    // Assessments Count
    const assessmentsRes = await pool.query(`SELECT test_type, severity, COUNT(*) as count FROM assessment_results GROUP BY test_type, severity`);
    
    return {
        roles: rolesRes.rows,
        appointments: appointmentsRes.rows,
        assessments: assessmentsRes.rows
    };
}

module.exports = {
    addCounselor,
    removeCounselor,
    getAllUsers,
    getAllCounselors,
    blockUser,
    unblockUser,
    getAnalyticsData
}