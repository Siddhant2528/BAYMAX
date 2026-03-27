const express = require("express")
const router = express.Router()

const adminController =
require("./admin.controller")

const verifyToken =
require("../../middleware/jwt.middleware")

const authorizeRole =
require("../../middleware/role.middleware")



// add counselor
router.post(
"/counselor",
verifyToken,
authorizeRole("admin"),
adminController.addCounselor
)


// remove counselor
router.delete(
"/counselor/:id",
verifyToken,
authorizeRole("admin"),
adminController.removeCounselor
)


// get all students
router.get(
"/users",
verifyToken,
authorizeRole("admin"),
adminController.getAllUsers
)


// get all counselors
router.get(
"/counselors",
verifyToken,
authorizeRole("admin"),
adminController.getAllCounselors
)


// block user
router.put(
"/block/:id",
verifyToken,
authorizeRole("admin"),
adminController.blockUser
)


// unblock user
router.put(
"/unblock/:id",
verifyToken,
authorizeRole("admin"),
adminController.unblockUser
)

// get analytics
router.get(
    "/analytics",
    verifyToken,
    authorizeRole("admin"),
    adminController.getAnalytics
)

module.exports = router