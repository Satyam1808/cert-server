const express = require('express');
const router = express.Router();
const { generateSecurePassword } = require('../controller/passwordGeneratorController');

// Password/Passphrase generation route
router.post('/generate', generateSecurePassword);

module.exports = router;
