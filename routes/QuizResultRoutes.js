const express = require('express');
const router = express.Router();
const quizResultController = require('../controller/QuizResultController');
const authMiddleware = require('../middlewares/userAuthMiddleware');
const rateLimit = require('express-rate-limit');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

// Apply rate limiting for quiz result submission
const quizSubmissionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // limit each user to 5 submissions per minute
    message: "Too many quiz submissions. Please try again later."
});

// Routes with middleware and rate limiting
router.post('/submit', authMiddleware, quizSubmissionLimiter, quizResultController.submitQuizResult);
router.get('/all-result', authMiddleware, quizResultController.getUserQuizResults);
router.get('/:quizID', authMiddleware, quizResultController.getQuizResultById);
router.get('/',authMiddleware, quizResultController.getAllQuizResults);
router.get('/admin/all-user-result',adminAuthMiddleware, quizResultController.getAllParticipanetInQuiz);

module.exports = router;
