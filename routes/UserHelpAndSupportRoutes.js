const express = require('express');
const router = express.Router();
const userHelpController = require('../controller/UserHelpController');
const authMiddleware = require('../middlewares/userAuthMiddleware');

// POST Route for submitting user help messages
router.post('/submit',authMiddleware, userHelpController.createUserHelp);

module.exports = router;
