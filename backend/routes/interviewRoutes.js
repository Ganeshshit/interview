const express = require('express');
const { body, param } = require('express-validator');
const interviewController = require('../controllers/interviewController');
const auth = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(auth);

// Create an interview
router.post(
    '/create',
    [
        body('interviewerId').notEmpty().withMessage('Interviewer ID is required'),
        body('scheduledTime').isISO8601().withMessage('Scheduled time must be a valid date'),
    ],
    interviewController.createInterview
);

// Schedule an interview
router.post('/schedule', interviewController.scheduleInterview);

// Get upcoming interviews for a user
router.get('/upcoming/:userId', interviewController.getUpcomingInterviews);

// Get completed interviews for a user
router.get('/completed/:userId', interviewController.getCompletedInterviews);

// Get interview details by ID
router.get('/:id', interviewController.getInterview);

// Update interview
// router.put('/:id', interviewController.updateInterview);

// Delete interview
// router.delete(
//     '/:id',
//     param('id').notEmpty().withMessage('Interview ID is required'),
//     interviewController.deleteInterview
// );

// Add feedback to interview
// router.post(
//     '/:id/feedback',
//     [
//         param('id').notEmpty().withMessage('Interview ID is required'),
//         body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
//         body('comments').notEmpty().withMessage('Comments are required'),
//     ],
//     interviewController.addFeedback
// );

// Join interview
router.post('/:id/join', [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('role').isIn(['interviewer', 'candidate']).withMessage('Invalid role')
], interviewController.joinInterview);

// Leave interview
router.post('/:id/leave', interviewController.leaveInterview);

// End interview
router.put('/:id/end', interviewController.endInterview);

// Submit code during interview
router.post('/submit-code', [
    body('interviewId').notEmpty().withMessage('Interview ID is required'),
    body('code').notEmpty().withMessage('Code cannot be empty'),
    body('language').notEmpty().withMessage('Language is required')
], interviewController.submitCode);

// Get all available questions
router.get('/questions', interviewController.getQuestions);

// Assign a question to an interview
router.post(
    '/assign-question',
    [
        body('interviewId').notEmpty().withMessage('Interview ID is required'),
        body('questionId').notEmpty().withMessage('Question ID is required'),
    ],
    interviewController.assignQuestion
);

// WebRTC signaling routes
router.post('/:roomId/offer', interviewController.handleOffer);
router.post('/:roomId/answer', interviewController.handleAnswer);
router.post('/:roomId/ice-candidate', interviewController.handleIceCandidate);
router.get('/:roomId/events', interviewController.handleEvents);

// Get upcoming interviews for interviewer
router.get('/upcoming/interviewer/:interviewerId', interviewController.getUpcomingInterviewsForInterviewer);

// Get upcoming interviews for candidate
router.get('/upcoming/candidate/:candidateId', interviewController.getUpcomingInterviewsForCandidate);

// Get completed interviews for interviewer
router.get('/completed/interviewer/:interviewerId', interviewController.getCompletedInterviewsForInterviewer);

// Get completed interviews for candidate
router.get('/completed/candidate/:candidateId', interviewController.getCompletedInterviewsForCandidate);

module.exports = router;


