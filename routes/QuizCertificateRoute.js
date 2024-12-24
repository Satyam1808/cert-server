const express = require('express');
const router = express.Router();
const certificateController = require('../controller/QuizCertificateController');
const authMiddleware = require('../middlewares/userAuthMiddleware');

// Route for sending the certificate email
router.post('/send-certificate-email', authMiddleware, certificateController.sendCertificateEmail);
router.get('/get-certificate', authMiddleware, certificateController.getCertificate);

module.exports = router;
