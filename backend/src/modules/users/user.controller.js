const userService = require("./user.service")

// GET profile
const getProfile = async (req, res) => {

    try {

        const userId = req.user.userId

        const user = await userService.getProfile(userId)

        res.json({
            message: "Profile fetched successfully",
            data: user
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}


// UPDATE profile
const updateProfile = async (req, res) => {

    try {

        const userId = req.user.userId

        const updatedUser = await userService.updateProfile(userId, req.body)

        res.json({
            message: "Profile updated successfully",
            data: updatedUser
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}


// ADD guardian contact
const addGuardianContact = async (req, res) => {

    try {

        const userId = req.user.userId

        const { guardianPhone } = req.body

        const result = await userService.updateGuardianContact(
            userId,
            guardianPhone
        )

        res.json({
            message: "Guardian contact updated",
            data: result
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}


// GET mental health history
const getMentalHealthHistory = async (req, res) => {

    try {

        const userId = req.user.userId

        const history = await userService.getMentalHealthHistory(userId)

        res.json({
            message: "Mental health history fetched",
            data: history
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    getProfile,
    updateProfile,
    addGuardianContact,
    getMentalHealthHistory
}