// routes/AddQuizRoutes.js
const express = require('express');
const upload = require('../middlewares/addQuizMulterConfig');
const addQuizController = require('../controller/AddQuizController');
const authenticateAdmin = require('../middlewares/authMiddleware');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Quizzes = require('../models/QuizModel');

// Route to add a quiz
router.post(
  '/add-quiz',
  authenticateAdmin,
  upload.single('imageFile'), // 'imageFile' should match the field name in FormData
  addQuizController.addQuiz
);

// Route to fetch all quizzes with pagination
router.get('/quizzes', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // No filters applied, so query is an empty object
    const query = {};

    // Get the total number of quizzes
    const totalQuizzes = await Quizzes.countDocuments(query);

    // Fetch quizzes with pagination and populate the admin's name
    const quizzes = await Quizzes.find(query)
      .populate('admin', 'name')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .exec();

    // Prepare the quizzes with the full image URLs
    const quizzesWithUrls = quizzes.map((quiz) => ({
      ...quiz.toObject(),
      image: quiz.image ? `${req.protocol}://${req.get('host')}/${quiz.image}` : null, // Correct handling of a single image
    }));

    // Send the paginated quizzes and total pages as a response
    res.status(200).json({
      quizzes: quizzesWithUrls,
      totalPages: Math.ceil(totalQuizzes / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete a quiz
router.delete('/quizzes/:id', authenticateAdmin, async (req, res) => {
  try {
    const quiz = await Quizzes.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Delete quiz image file if it exists
    const deleteFile = (filePath) => {
      const fullPath = path.join(__dirname, '..', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log(`Deleted file: ${fullPath}`);
        }
      });
    };

    if (quiz.image) {
      deleteFile(quiz.image);
    }

    await Quizzes.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz from database' });
  }
});


// Route to fetch all quizzes
router.get('/all-quizzes', addQuizController.getAllQuizzes);

module.exports = router;
