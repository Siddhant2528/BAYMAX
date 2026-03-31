const express = require('express');
const router = express.Router();
const aerpController = require('./aerp.controller');
const verifyToken = require('../../middleware/jwt.middleware');

// Treat this as an external service mock, but we still verify tokens for security
router.get('/student/:collegeId', verifyToken, aerpController.getStudentAERPRecord);
router.get('/attendance/:collegeId', verifyToken, aerpController.getAttendanceLogs);

module.exports = router;