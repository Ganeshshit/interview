const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const interviewController = require('../controllers/interviewController');
const userController = require('../controllers/userController');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getCurrentUser);

// Interview routes
router.get('/interviews/upcoming/:userId', auth, interviewController.getUpcomingInterviews);
router.get('/interviews/completed/:userId', auth, interviewController.getCompletedInterviews);
router.get('/interviews/:interviewId', auth, interviewController.getInterviewDetails);
router.post('/interviews/:interviewId/join', auth, interviewController.joinInterview);

// User routes
router.get('/users/interviewers', auth, userController.getInterviewers);
router.get('/users/candidates', auth, userController.getCandidates);
router.get('/users/:userId', auth, userController.getUserDetails);

// Dashboard routes
router.get('/dashboard/interviewer/:interviewerId', auth, interviewController.getInterviewerDashboard);
router.get('/dashboard/interviewer/:interviewerId/stats', auth, interviewController.getInterviewerStats);

// Interviewer profile routes
router.get('/interviewer/:interviewerId/profile', auth, userController.getInterviewerProfile);
router.put('/interviewer/:interviewerId/profile', auth, userController.updateInterviewerProfile);
router.get('/interviewer/:interviewerId/candidates', auth, userController.getAvailableCandidates);

module.exports = router;