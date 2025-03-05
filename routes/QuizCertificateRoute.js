const express = require('express');
const router = express.Router();
const QuizCertificateController = require('../controller/QuizCertificateController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

router.post('/create',userAuthMiddleware, QuizCertificateController.createCertificate);
router.get('/get',userAuthMiddleware, QuizCertificateController.getCertificate);
router.get('/verify',userAuthMiddleware, QuizCertificateController.verifyCertificate); // Verification via URL
router.get("/getVerificationUrl",userAuthMiddleware, QuizCertificateController.getVerificationByCertId);


module.exports = router;
