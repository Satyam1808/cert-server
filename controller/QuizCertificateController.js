const { sendCertificateToEmail } = require('../service/QuizCeertificateService');
const Certificate = require('../models/QuizCertificateModel');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

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

        const certificatePDF = await sendCertificateToEmail(user.name, user.email);

        const certificatesDir = path.join(__dirname, '../certificates');
        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
        }

        const sanitizedQuizName = quizName.replace(/[^a-zA-Z0-9-_]/g, '_');
        const certificatePath = path.join(certificatesDir, `${userId}_${sanitizedQuizName}.pdf`);

        // Save the certificate PDF
        fs.writeFileSync(certificatePath, certificatePDF);

        // Save certificate details in the database
        const certificate = new Certificate({
            userId,
            certificateName: `Certificate for ${user.name}`,
            certificatePath,
            quizName,
            quizId,
            createdAt: new Date(),
        });

        await certificate.save();

        // Attempt to delete temporary file (if needed)
        const tempFilePath = path.join(__dirname, 'assets', 'temp_certificate.pdf');
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (err) {
            console.error("Error deleting temporary file:", err.message);
        }

        res.status(200).send({ message: "Certificate sent to email successfully." });
    } catch (err) {
        console.error("Error in sendCertificateEmail:", err.message);
        res.status(500).send({ message: "Internal Server Error" });
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
