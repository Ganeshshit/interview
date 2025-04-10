const express = require('express');
const router = express.Router();
const auth =require ('../middleware/auth')
const { createQuestion } = require('../controllers/questionController');

// router.post('/interviews/:interviewId/questions', auth, createQuestion);
// router.get('/interviews/:interviewId/questions', authenticate, getQuestionsForInterview);
router.post('/interviews/:interviewId/questions', createQuestion);

module.exports = router;


