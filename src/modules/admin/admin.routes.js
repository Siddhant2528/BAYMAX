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



// get all users
router.get(
"/users",
verifyToken,
authorizeRole("admin"),
adminController.getAllUsers
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



module.exports = router