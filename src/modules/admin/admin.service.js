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
        RETURNING id,name,email,role`,

        [name,email,hashedPassword,collegeId]

    )

    return result.rows[0]
}



// get all users
const getAllUsers = async()=>{

    const result = await pool.query(

        `SELECT id,name,email,role,is_blocked,created_at
         FROM users
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



module.exports = {
    addCounselor,
    getAllUsers,
    blockUser,
    unblockUser
}