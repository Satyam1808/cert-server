const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    certificateName: { type: String, required: true },
    certificatePath: { type: String, required: true },
    quizName: { type: String, required: true },
    quizId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
