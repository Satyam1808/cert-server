const mongoose = require('mongoose');

const UserResponseSchema = new mongoose.Schema({
    questionID: { type: String, required: true },
    selectedOptionID: { type: String, required: true },
});

const QuizSchema = new mongoose.Schema({
    quizID: { type: String, required: true },
    quizType: { type: String, required: true }, // To store quiz type like "Quiz of the Week", "Latest Quiz", etc.
    userResponses: [UserResponseSchema],
    totalScore: { type: Number, required: true },
    attemptedTime: { type: Number, required: true }, // Time taken in milliseconds
    submittedAt: { type: Date, default: Date.now },
});

const UserQuizResultSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    quizResults: [QuizSchema],
});

const QuizResult = mongoose.model('QuizResult', UserQuizResultSchema);

module.exports = QuizResult;
