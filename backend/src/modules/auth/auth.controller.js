const authService = require("./auth.service")

const signup = async (req, res) => {

    try {

        const result = await authService.signup(req.body)

        res.status(201).json({
            message: "User created",
            data: result
        })

    } catch (error) {

        res.status(400).json({
            message: error.message
        })
    }
}


const login = async (req, res) => {

    try {

        const { email, password } = req.body

        const result = await authService.login(email, password)

        res.json({
            message: "Login successful",
            data: result
        })

    } catch (error) {

        res.status(401).json({
            message: error.message
        })
    }
}


const getMe = async (req, res) => {

    try {

        const user = await authService.getCurrentUser(req.user.userId)

        res.json({
            user
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}


const logout = async (req, res) => {

    res.json({
        message: "Logout successful (client should delete token)"
    })
}

module.exports = {
    signup,
    login,
    getMe,
    logout
}