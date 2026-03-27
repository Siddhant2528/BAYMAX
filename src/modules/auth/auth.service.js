const {pool} = require("../../config/db")
const bcrypt = require("bcrypt")
const generateToken = require("../../utils/generateToken")

const signup = async (data) => {

    const { name, email, password, collegeId, guardianPhone } = data

    const existingUser = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    )

    if (existingUser.rows.length > 0)
        throw new Error("User already exists")

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await pool.query(
        `INSERT INTO users
        (name,email,password,role,college_id,guardian_phone)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING id,name,email,role`,
        [name, email, hashedPassword, "student", collegeId, guardianPhone]
    )

    const user = newUser.rows[0]

    const token = generateToken(user)

    return { user, token }
}


const login = async (email, password) => {

    const userResult = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    )

    if (userResult.rows.length === 0)
        throw new Error("Invalid credentials")

    const user = userResult.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch)
        throw new Error("Invalid credentials")

    const token = generateToken(user)

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    }
}


const getCurrentUser = async (userId) => {

    const result = await pool.query(
        `SELECT id,name,email,role,college_id,guardian_phone
         FROM users WHERE id=$1`,
        [userId]
    )

    return result.rows[0]
}

module.exports = {
    signup,
    login,
    getCurrentUser
}