const express = require("express")
const router = express.Router()

const resourceController = require("./resource.controller")

const verifyToken = require("../../middleware/jwt.middleware")
const authorizeRole = require("../../middleware/role.middleware")


// get all resources
router.get("/", verifyToken, resourceController.getResources)


// get single resource
router.get("/:id", verifyToken, resourceController.getResource)


// add resource (admin only)
router.post(
    "/",
    verifyToken,
    authorizeRole("admin"),
    resourceController.createResource
)


// delete resource
router.delete(
    "/:id",
    verifyToken,
    authorizeRole("admin"),
    resourceController.deleteResource
)

module.exports = router