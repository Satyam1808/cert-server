const express = require('express');
const router = express.Router();
const authController = require('../controller/Authcontroller');

// Register with OTP
router.post('/register', authController.register);

// Verify OTP
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOtp);



module.exports = router;
