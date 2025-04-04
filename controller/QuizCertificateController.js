const Certificate = require('../models/QuizCertificateModel');
const { generateCertificate, finalizeCertificate, addVerifiedStamp } = require('../service/QuizCeertificateService');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const User = require('../models/User');
const sizeOf = require('image-size');

const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const CERTIFICATE_FOLDER = 'generated_certificates';

function generateCertificateId() {
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const timePart = now.toTimeString().split(" ")[0].replace(/:/g, "");
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    return `CERT-${datePart}-${timePart}-${randomPart}`;
}

const generateSignature = (certificateId, userId) => {
    return crypto.createHmac('sha256', SECRET_KEY)
        .update(`${certificateId}|${userId}`)
        .digest('hex');
};

exports.createCertificate = async (req, res) => {
    const { userId, quizName, quizId, name } = req.body;

    if (!userId || !quizName || !quizId || !name) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const existingCertificate = await Certificate.findOne({ userId, quizId });
        if (existingCertificate) {
            return res.status(200).json({ 
                message: "Certificate already exists", 
                certificate: existingCertificate 
            });
        }

        const certificateId = generateCertificateId();
        const signature = generateSignature(certificateId, userId);
        const verificationUrl = `${BASE_URL}/api/certificates/verify?certId=${certificateId}&sig=${signature}`;
        const certificateFilename = `${certificateId}.png`;
        const certificatePath = path.join(CERTIFICATE_FOLDER, certificateFilename);
        const certificateUrl = `generated_certificates/${certificateFilename}`;
        
        await generateCertificate(name, quizName, certificateId);

        const certificate = new Certificate({
            userId,
            certificateId,
            certificateName: `Certificate for ${name}`,
            certificatePath,
            certificateUrl,
            quizName,
            quizId,
            verificationUrl,
            verificationStatus: "Not Verified",
        });

        await certificate.save();
        res.status(201).json({ message: "Certificate generated successfully", certificate });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.verifyCertificate = async (req, res) => {
    const { certId, sig } = req.query;

    if (!certId || !sig) {
        return res.status(400).json({ message: "Missing required parameters." });
    }

    try {
        const certificate = await Certificate.findOne({ certificateId: certId });
        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found." });
        }

        const expectedSignature = generateSignature(certId, certificate.userId);
        if (sig !== expectedSignature) {
            return res.status(403).json({ message: "Invalid verification link." });
        }

        if (certificate.verificationStatus === "Verified") {
            return res.status(200).json({ message: "Certificate already verified", certificate });
        }

        await finalizeCertificate(certificate.certificatePath, certificate.certificateId, certificate.verificationUrl);
        await addVerifiedStamp(certificate.certificatePath);

        certificate.verificationStatus = "Verified";
        await certificate.save();

        const user = await User.findById(certificate.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        await sendCertificateToEmail(user.name, user.email, certificate.certificatePath, certificate.certificateId);

        res.status(200).json({ message: "Certificate verified and sent successfully", certificate });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const sendCertificateToEmail = async (name, email, certificateImagePath, certificateId) => {
    try {
        if (!fs.existsSync(certificateImagePath)) {
            throw new Error("Certificate image not found");
        }

        const absolutePath = path.resolve(certificateImagePath);
        const dimensions = sizeOf(absolutePath);
        const { width, height } = dimensions;

        const pdfPath = path.join(__dirname, 'temp_certificate.pdf');
        const doc = new PDFDocument({ size: [width, height], margin: 0 });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);
        doc.image(absolutePath, 0, 0, { width, height });
        doc.end();

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        const certificatePDF = fs.readFileSync(pdfPath);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Certificate of Completion',
            text: `Dear ${name},\n\nCongratulations! Please find your certificate attached.\n\nBest regards,\nTeam`,
            attachments: [{ filename: 'certificate.pdf', content: certificatePDF, contentType: 'application/pdf' }]
        };

        await transporter.sendMail(mailOptions);
        fs.unlinkSync(pdfPath);

        const updatedCert = await Certificate.findOneAndUpdate(
            { certificateId: certificateId },
            { $set: { emailSentStatus: "Sent" } },
            { new: true }
        );

        if (!updatedCert) {
            throw new Error("Failed to update emailSentStatus in DB.");
        }
    } catch (error) {
        throw new Error('Failed to send certificate');
    }
};

exports.getCertificate = async (req, res) => {
    const { quizId, userId } = req.query;

    if (!quizId || !userId) {
        return res.status(400).json({ message: "Quiz ID and User ID required" });
    }

    try {
        const certificate = await Certificate.findOne({ userId, quizId });
        if (!certificate) return res.status(404).json({ message: "Certificate not found" });

        res.status(200).json({ certificate });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getVerificationByCertId = async (req, res) => {
    const { certId } = req.query;

    if (!certId) {
        return res.status(400).json({ message: "Certificate ID is required" });
    }

    try {
        const certificate = await Certificate.findOne({ certificateId: certId });

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        res.status(200).json({
            verificationUrl: certificate.verificationUrl
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getUserCertificates = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const certificates = await Certificate.find({ userId });
        res.status(200).json({ certificates });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};