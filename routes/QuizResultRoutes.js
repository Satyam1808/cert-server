const express = require('express');
const router = express.Router();
const quizResultController = require('../controller/QuizResultController');
const authMiddleware = require('../middlewares/userAuthMiddleware');
const rateLimit = require('express-rate-limit');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

const quizSubmissionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5, 
    message: "Too many quiz submissions. Please try again later."
});

router.post('/submit', authMiddleware, quizSubmissionLimiter, quizResultController.submitQuizResult);
router.get('/all-result', authMiddleware, quizResultController.getUserQuizResults);
router.get('/:quizID', authMiddleware, quizResultController.getQuizResultById);
router.get('/',authMiddleware, quizResultController.getAllQuizResults);
router.get('/admin/all-user-result',adminAuthMiddleware, quizResultController.getAllParticipanetInQuiz);

module.exports = router;
