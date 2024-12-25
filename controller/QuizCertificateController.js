const { sendCertificateToEmail } = require('../service/QuizCeertificateService');
const Certificate = require('../models/QuizCertificateModel');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const os = require("os");

// Sends a certificate to the user's email and stores the certificate details in the database
exports.sendCertificateEmail = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send({ message: "Unauthorized: Token missing" });

    const { quizName, quizId } = req.body;
    if (!quizName || !quizId) return res.status(400).send({ message: "Quiz name and id are required" });

    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).send({ message: "User not found" });

        console.log(`Starting certificate generation for user: ${user.name}, email: ${user.email}`);

        // Generate and send the certificate
        const certificatePDF = await sendCertificateToEmail(user.name, user.email);
        if (!certificatePDF) throw new Error("Failed to generate certificate PDF");

        console.log("Certificate generated successfully");

        // Save certificate details to database
        const certificate = new Certificate({
            userId,
            certificateName: `Certificate for ${user.name}`,
            quizName,
            quizId,
            createdAt: new Date(),
        });

        await certificate.save();
        console.log("Certificate details saved to database");

        res.status(200).send({ message: "Certificate sent to email successfully." });
    } catch (err) {
        console.error("Error in sendCertificateEmail:", err.message);
        res.status(500).send({
            message: "Internal Server Error",
            error: "Failed to generate or send certificate",
            details: err.message,
        });
    }
};


// Fetches certificate details for a specific quiz and user
exports.getCertificate = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send({ message: "Unauthorized: Token missing" });

    const { quizId } = req.query; // Extract the quiz name from query parameters
    if (!quizId) return res.status(400).send({ message: "Quiz id is required" });
    
    try {
        const userId = req.user.userId;

        // Find the certificate by userId and quizName
        const certificate = await Certificate.findOne({ userId, quizId });
        if (!certificate) return res.status(404).send({ message: "Certificate not found" });

        // Send the certificate details
        res.status(200).json({
            _id: certificate._id,
            userId: certificate.userId,
            certificateName: certificate.certificateName,
            certificatePath: path.resolve(certificate.certificatePath),
            quizName: certificate.quizName,
            quizId: certificate.quizId,
            createdAt: certificate.createdAt,
        });
    } catch (err) {
        console.error("Error in getCertificate:", err.message);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
