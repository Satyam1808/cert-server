const Jimp = require("jimp");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const certificateTemplatePath = path.resolve(__dirname, "../assets/certin_certificate.png");
const verifiedStampPath = path.resolve(__dirname, "../assets/verified_stamp.png");
const generatedCertificatesDir = path.resolve(__dirname, "../generated_certificates");

// Ensure the output directory exists
if (!fs.existsSync(generatedCertificatesDir)) {
    fs.mkdirSync(generatedCertificatesDir, { recursive: true });
}

// Utility function to sanitize filenames
const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9_-]/g, "_");

// Function to generate a short hash from a string (used for Certificate ID)
const generateShortHash = (str) => crypto.createHash('md5').update(str).digest("hex").substring(0, 8);

//  **Generate the Initial Certificate (Without QR Code & ID)**
exports.generateCertificate = async (name, quizName, certificateId) => {
    try {
        if (!fs.existsSync(certificateTemplatePath)) {
            throw new Error(`Certificate template not found at ${certificateTemplatePath}`);
        }

        const sanitizedCertificateId = sanitizeFilename(certificateId);
        const certificateTemplate = await Jimp.read(certificateTemplatePath);
        const fontNameTxt = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
        const fontQuizNameTxt = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);

        // Calculate text positions dynamically for center alignment
        const nameX = (certificateTemplate.bitmap.width - Jimp.measureText(fontNameTxt, name)) / 2;
        const nameY = 520;  // Adjust based on your design

        const quizX = (certificateTemplate.bitmap.width - Jimp.measureText(fontQuizNameTxt, quizName)) / 2;
        const quizY = 790;  // Adjust based on your design

        // Print Name & Quiz Name (both horizontally centered)
        certificateTemplate.print(fontNameTxt, nameX, nameY, name);
        certificateTemplate.print(fontQuizNameTxt, quizX, quizY, quizName);

        // Save the certificate
        const outputPath = path.join(generatedCertificatesDir, `${sanitizedCertificateId}.png`);
        await certificateTemplate.writeAsync(outputPath);

        return outputPath;

    } catch (error) {
        console.error("Error generating certificate:", error.message);
        throw new Error(`Failed to generate certificate: ${error.message}`);
    }
};


// **Finalizing Certificate with QR & Certificate ID**
exports.finalizeCertificate = async (certificatePath, certificateId, verificationUrl) => {
    try {
        if (!fs.existsSync(certificatePath)) {
            throw new Error(`Certificate file not found at ${certificatePath}`);
        }

        //const shortId = generateShortHash(certificateId);
        const certificate = await Jimp.read(certificatePath);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        // Generate QR code
        const qrBuffer = await QRCode.toBuffer(verificationUrl);
        const qrImage = await Jimp.read(qrBuffer);
        qrImage.resize(250, 250); // Set QR size

        //  **Set New Positions with Extra Margins**
        const marginTop = 60;  // Extra margin from the top
        const marginRight = 120; // Extra margin from the right
        const marginLeft = 100;  // Margin for QR Code

        const certIdX = certificate.bitmap.width - marginRight - Jimp.measureText(font, `Certificate ID: ${certificateId}`);
        const certIdY = marginTop + 30; // Extra margin added from top

        const qrX = marginLeft;
        const qrY = marginTop + 250; // Extra margin added from top

        //  **Add Certificate ID & QR Code**
        certificate.print(font, certIdX, certIdY, `Certificate ID: ${certificateId}`);
        certificate.composite(qrImage, qrX, qrY);

        // Save the updated certificate
        await certificate.writeAsync(certificatePath);

        return certificatePath;

    } catch (error) {
        console.error("Error finalizing certificate:", error.message);
        throw new Error(`Failed to finalize certificate: ${error.message}`);
    }
};


//  **Adding Verified Stamp (Center-Bottom)**
exports.addVerifiedStamp = async (certificatePath) => {
    try {
        if (!fs.existsSync(verifiedStampPath)) {
            throw new Error(`Verified stamp image not found at ${verifiedStampPath}`);
        }

        const certificate = await Jimp.read(certificatePath);
        const verifiedStamp = await Jimp.read(verifiedStampPath);
        verifiedStamp.resize(190, 190); // Adjust stamp size

        //  **Align Center at Bottom with Margin**
        const marginBottom = 100;
        const verifiedX = (certificate.bitmap.width - verifiedStamp.bitmap.width) / 2;
        const verifiedY = certificate.bitmap.height - verifiedStamp.bitmap.height - marginBottom;

        certificate.composite(verifiedStamp, verifiedX, verifiedY);

        await certificate.writeAsync(certificatePath);

        return certificatePath;

    } catch (error) {
        console.error("Error adding verified stamp:", error.message);
        throw new Error(`Failed to add verified stamp: ${error.message}`);
    }
};
