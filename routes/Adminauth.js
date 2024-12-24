const express = require('express');
const router = express.Router();
const adminAuthcontroller = require('../controller/AdminAuthcontroller');

// Register directly without OTP
router.post('/register', adminAuthcontroller.register);
router.post('/login', adminAuthcontroller.login);
router.post('/forgot-password', adminAuthcontroller.forgotPassword);
router.post('/reset-password', adminAuthcontroller.resetPassword);


module.exports = router;
