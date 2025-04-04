const express = require('express');
const upload = require('../middlewares/addQuizMulterConfig');
const addQuizController = require('../controller/AddQuizController');
const authenticateAdmin = require('../middlewares/authMiddleware');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Quizzes = require('../models/QuizModel');

router.post(
  '/add-quiz',
  authenticateAdmin,
  upload.single('imageFile'),
  addQuizController.addQuiz
);

router.get('/quizzes', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = {};

    const totalQuizzes = await Quizzes.countDocuments(query);

    const quizzes = await Quizzes.find(query)
      .populate('admin', 'name')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .exec();

    const quizzesWithUrls = quizzes.map((quiz) => ({
      ...quiz.toObject(),
      image: quiz.image ? `${req.protocol}://${req.get('host')}/${quiz.image}` : null,
    }));

    res.status(200).json({
      quizzes: quizzesWithUrls,
      totalPages: Math.ceil(totalQuizzes / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/quizzes/:id', authenticateAdmin, async (req, res) => {
  try {
    const quiz = await Quizzes.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const deleteFile = (filePath) => {
      const fullPath = path.join(__dirname, '..', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    };

    if (quiz.image) {
      deleteFile(quiz.image);
    }

    await Quizzes.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz from database' });
  }
});

router.get('/app/all-quizzes', userAuthMiddleware, addQuizController.getAllQuizzes);
router.get('/all-quizzes', authenticateAdmin, addQuizController.getAllQuizzes);

module.exports = router;