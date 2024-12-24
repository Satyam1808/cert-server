const QuizResult = require('../models/QuizResultModel');
const Joi = require('joi');

// Joi schema for input validation
const quizResultSchema = Joi.object({
    quizID: Joi.string().required(),
    quizType: Joi.string().valid('Quiz of the week', 'Latest Quiz', 'Quiz by Category').required(),
    userResponses: Joi.array().items(
        Joi.object({
            questionID: Joi.string().required(),
            selectedOptionID: Joi.string().required(),
        })
    ).min(1).required(),
    totalScore: Joi.number().integer().min(0).required(),
    attemptedTime: Joi.number().integer().min(0).required()
});

exports.submitQuizResult = async (req, res) => {
    try {
        const { userID, quizResults } = req.body;

        // Validate required fields
        if (!userID || !quizResults || !Array.isArray(quizResults)) {
            return res.status(400).json({ message: "Invalid input data." });
        }

        // Construct new quiz results entries
        const formattedQuizResults = quizResults.map((quiz) => ({
            quizID: quiz.quizID,
            quizType: quiz.quizType,
            userResponses: quiz.userResponses,
            totalScore: quiz.totalScore,
            attemptedTime: quiz.attemptedTime,
            submittedAt: quiz.submittedAt || new Date()
        }));

        // Update or create the user’s quiz results
        const userQuizResult = await QuizResult.findOneAndUpdate(
            { userID },
            { $push: { quizResults: { $each: formattedQuizResults } } },
            { new: true, upsert: true } // Create if not exists
        );

        res.status(201).json({ message: "Quiz result submitted successfully." });
    } catch (error) {
        console.error("Error submitting quiz result:", error);
        res.status(500).json({ message: "Server error while submitting quiz result." });
    }
};

exports.getUserQuizResults = async (req, res) => {
    try {
        // Fetch all quiz results for the authenticated user
        const userQuizResults = await QuizResult.findOne({ userID: req.user.userId });

        if (!userQuizResults || !userQuizResults.quizResults || userQuizResults.quizResults.length === 0) {
            return res.status(404).json({ 
                message: "No quiz results found for this user.", 
                quizResults: [], 
                userID: req.user.userId 
            });
        }


        // Respond with userID and valid quizResults
        res.status(200).json({
            userID: req.user.userId,
            quizResults: userQuizResults.quizResults, // Make sure this is an array of objects
        });
    } catch (error) {
        console.error("Error fetching user quiz results:", error);
        res.status(500).json({ message: "Server error while fetching quiz results." });
    }
};



// Get all quiz results for all users
exports.getAllQuizResults = async (req, res) => {
    try {
        const quizResults = await QuizResult.find({}); // Adjust based on your schema
        res.json(quizResults); // Directly return the array without wrapping it in an object
    } catch (error) {
        console.error("Error fetching quiz results:", error);
        res.status(500).json({ error: "Server error while fetching quiz results" });
    }
};


exports.getAllParticipanetInQuiz = async (req, res) => {
    try {
        // Fetch all quiz results
        const quizResults = await QuizResult.find({});

        // Get distinct user IDs and count them
        const uniqueUserIds = await QuizResult.distinct('userID');
        const uniqueUserCount = uniqueUserIds.length;

        // Send the response
        res.json({ quizResults, uniqueUserCount });
    } catch (error) {
        console.error("Error fetching quiz results:", error);
        res.status(500).json({ error: "Server error while fetching quiz results" });
    }
};




// Get specific quiz result by quizID for the authenticated user
exports.getQuizResultById = async (req, res) => {
    try {
        const { quizID } = req.params;

        // Validate quizID format
        if (!quizID || typeof quizID !== 'string') {
            return res.status(400).json({ message: "Invalid quiz ID." });
        }

        const userQuizResult = await QuizResult.findOne(
            { userID: req.user.userId, "quizResults.quizID": quizID },
            { "quizResults.$": 1 }
        );

        if (!userQuizResult || userQuizResult.quizResults.length === 0) {
            return res.status(404).json({ message: "Quiz result not found." });
        }

        res.status(200).json({ quizResult: userQuizResult.quizResults[0] });
    } catch (error) {
        console.error("Error fetching quiz result by ID:", error);
        res.status(500).json({ message: "Server error while fetching quiz result." });
    }
};
