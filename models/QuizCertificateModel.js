const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    certificateId: { type: String, unique: true, required: true, index: true },
    certificateName: { type: String, required: true },
    certificatePath: { type: String, required: true },
    certificateUrl: { type: String, required: true }, // URL to access certificate
    quizName: { type: String, required: true },
    quizId: { type: String, required: true },
    verificationStatus: { type: String, enum: ['Verified', 'Not Verified'], default: 'Not Verified' },
    verificationUrl: { type: String }, // Secure verification URL
    signature: { type: String }, // Store HMAC signature for verification logs
    emailSentStatus: { type: String, default: "Not Sent" }, // Track email status
    createdAt: { type: Date, default: Date.now }
});

// Generate a secure verification URL
certificateSchema.methods.generateVerificationUrl = function () {
    const data = `${this.certificateId}|${this.userId}`;
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    return `http://localhost:5000/certificates/verify?certId=${this.certificateId}&sig=${signature}`;
};


const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
