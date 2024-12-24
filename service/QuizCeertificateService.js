const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Certificate template path
const certificateTemplatePath = path.join(__dirname, '../assets/certin_certificate.png');

exports.sendCertificateToEmail = async (name, email) => {
    try {
        // Determine the certificate template dimensions
        const templateWidth = 600; // Width of the template in points
        const templateHeight = 400; // Height of the template in points

        // Create a PDF document with the exact size of the certificate template
        const doc = new PDFDocument({
            size: [templateWidth, templateHeight], // Set the page size to match the template
            margin: 0 // No margins
        });

        const tempPdfPath = path.join(__dirname, '../assets/temp_certificate.pdf');
        const writeStream = fs.createWriteStream(tempPdfPath);

        // Pipe the PDF document to the write stream
        doc.pipe(writeStream);

        // Add certificate template as background
        doc.image(certificateTemplatePath, 0, 0, { width: templateWidth, height: templateHeight });

        // Add the recipient's name in the appropriate position
        doc
            .font('Times-Roman') // Professional sans-serif font
            .fontSize(30) // Font size for the name
            .fillColor('black') // Text color
            .text(name, 0, 210, {
                align: 'center', // Center the text horizontally
                baseline: 'middle' // Adjust the vertical position as needed
            });

        // Finalize the PDF file
        doc.end();

        // Wait for the write stream to finish
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Read the generated PDF
        const certificatePDF = fs.readFileSync(tempPdfPath);

        // Configure nodemailer
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
            text: `Dear ${name},\n\nCongratulations on completing the quiz! Please find your certificate attached.`,
            attachments: [
                {
                    filename: 'certificate.pdf',
                    content: certificatePDF
                }
            ]
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Clean up temporary PDF file
        fs.unlinkSync(tempPdfPath);

        return certificatePDF; // Return the PDF buffer

    } catch (error) {
        console.error('Error generating or sending certificate:', error);
        throw new Error('Failed to generate or send certificate');
    }
};
