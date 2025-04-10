const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// ... existing routes ...

// Get all candidates (for interviewers)
router.get('/candidates', authMiddleware, userController.getCandidates);

// Get all interviewers (for candidates)
router.get('/interviewers', authMiddleware, userController.getInterviewers);

// ... existing routes ...

module.exports = router; 