const Quiz = require('../models/QuizModel'); 

exports.addQuiz = async (req, res) => {
  try {
    const { quizData } = req.body;

    if (!quizData) {
      return res.status(400).json({ message: 'No quiz data provided.' });
    }

    let parsedQuizData;
    try {
      parsedQuizData = JSON.parse(quizData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid quiz data format.' });
    }

    const { quizTitle, description, quizType, questions, appCategory } = parsedQuizData;

    if (!quizTitle || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields: quizTitle and questions.' });
    }

    if (quizType === 'Quiz by Category' && !appCategory) {
      return res.status(400).json({ message: 'Please provide appCategory for this quiz type.' });
    }

    const imageFilePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const newQuiz = new Quiz({
      quizTitle: quizTitle.trim(),
      description: description ? description.trim() : '',
      quizType: quizType.trim(),
      questions,
      image: imageFilePath,
      admin: req.admin._id,
      appCategory: quizType === 'Quiz by Category' ? appCategory : undefined,
    });

    await newQuiz.save();

    res.status(201).json({
      message: 'Quiz added successfully',
      quiz: newQuiz,
    });
  } catch (error) {
    console.error('Error adding quiz:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found.' });
    }

    res.status(200).json({
      message: 'Quizzes fetched successfully',
      quizzes,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};