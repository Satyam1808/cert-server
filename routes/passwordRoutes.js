const express = require('express');
const router = express.Router();
const { checkPasswordStrength } = require('../controller/passwordController');

// Password strength route
router.post('/strength', checkPasswordStrength);

module.exports = router;
