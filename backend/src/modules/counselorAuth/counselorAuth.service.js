const {pool} = require("../../config/db")
const bcrypt = require("bcrypt")
const generateToken = require("../../utils/generateToken")

const counselorLogin = async (email, password) => {

    const result = await pool.query(
        "SELECT * FROM users WHERE email=$1 AND role='counselor'",
        [email]
    )

    if (result.rows.length === 0) {
        throw new Error("Counselor not found")
    }

    const counselor = result.rows[0]

    const passwordMatch = await bcrypt.compare(password, counselor.password)

    if (!passwordMatch) {
        throw new Error("Invalid credentials")
    }

    const token = generateToken(counselor)

    return {
        counselor: {
            id: counselor.id,
            name: counselor.name,
            email: counselor.email,
            role: counselor.role,
            collegeId: counselor.college_id
        },
        token
    }
}

module.exports = {
    counselorLogin
}