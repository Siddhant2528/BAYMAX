const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user

            if (!user || !user.role) {
                return res.status(401).json({
                    message: "Unauthorized: No user role found"
                })
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: `Access denied: ${user.role} not allowed`
                })
            }

            next()
        } catch (error) {
            return res.status(500).json({
                message: "Role authorization error",
                error: error.message
            })
        }
    }
}

module.exports = authorizeRole