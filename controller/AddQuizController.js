const Quiz = require('../models/QuizModel'); // Assuming you have a Quiz model

exports.addQuiz = async (req, res) => {
  try {
    // Log incoming data for debugging purposes
    console.log('Request Body:', req.body);
    console.log('Image file:', req.file);
    console.log('Admin:', req.admin);

    // Extract the quiz data from the request body
    const { quizData } = req.body;

    // Validate if quizData is provided
    if (!quizData) {
      return res.status(400).json({ message: 'No quiz data provided.' });
    }

    // Parse the quiz data from JSON format
    const parsedQuizData = JSON.parse(quizData);

    // Destructure necessary fields from the parsed data
    const { quizTitle, description, quizType, questions, appCategory} = parsedQuizData;

    // Check if required fields are provided
    if (!quizTitle || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Prepare the image file path, if available
    const imageFilePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

    // Create a new quiz object with required fields
    const newQuiz = new Quiz({
      quizTitle,
      description,
      quizType,
      questions,
      image: imageFilePath,  // Optional: if image is uploaded
      admin: req.admin._id,   // Admin ID will be set by the auth middleware
    });

    // Conditionally add appCategory and/or level based on quizType
    if (quizType === 'Quiz by Category') {
      if (!appCategory) {
        return res.status(400).json({ message: 'Please provide appCategory and level for this quiz type.' });
      }
      newQuiz.appCategory = appCategory;
      
    } 

    // Save the new quiz to the database
    await newQuiz.save();

    // Respond with a success message and the saved quiz
    res.status(201).json({
      message: 'Quiz added successfully',
      quiz: newQuiz,
    });
  } catch (error) {
    // Log error for debugging and send a 500 response if there's an issue
    console.error('Error adding quiz:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// API to get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    // Fetch all quizzes from the database
    const quizzes = await Quiz.find();

    // Check if quizzes exist
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found.' });
    }

    // Send the quizzes as a response
    res.status(200).json({
      message: 'Quizzes fetched successfully',
      quizzes,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};