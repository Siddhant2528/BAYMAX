const express = require('express');
const router = express.Router();

const controller = require('./sessionNotes.controller');
const verifyToken = require('../../middleware/jwt.middleware');
const authorizeRole = require('../../middleware/role.middleware');

// Create a new session note
router.post('/', verifyToken, authorizeRole('counselor'), controller.createNote);

// Get all notes for the logged-in counselor
router.get('/', verifyToken, authorizeRole('counselor'), controller.getNotes);

module.exports = router;
