const counselorAuthService = require("./counselorAuth.service")

const loginCounselor = async (req, res) => {

    try {

        const { email, password } = req.body

        const result = await counselorAuthService.counselorLogin(email, password)

        res.status(200).json({
            message: "Counselor login successful",
            data: result
        })

    } catch (error) {

        res.status(401).json({
            message: error.message
        })
    }
}

module.exports = {
    loginCounselor
}