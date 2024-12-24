const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const optionSchema = new Schema({
  id: Number,
  value: String,
});

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, required: true },
  options: [optionSchema],
  correctOption: { type: String, required: true },
  points: { type: Number, required: true },
 
});

const quizSchema = new Schema(
  {
    quizTitle: { type: String, required: true },
    description: { type: String },
    image: { type: String }, // Path to the image file
    questions: [questionSchema],
    quizType: { type: String, required: true },
    appCategory: { type: String },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: { createdAt: 'createdAt' } }
);

module.exports = mongoose.model('Quiz', quizSchema);
