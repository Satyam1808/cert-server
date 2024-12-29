const express = require('express');
const router = express.Router();
const {createUserHelp, getAllUserHelpQueries, updateUserHelpStatus} = require('../controller/UserHelpController');
const authMiddleware = require('../middlewares/userAuthMiddleware');
const adminMiddleware = require('../middlewares/authMiddleware');

// POST Route for submitting user help messages
router.post('/submit',authMiddleware, createUserHelp);
router.get('/queries', adminMiddleware, getAllUserHelpQueries); // Get all queries (no token required)
router.put('/status/:token',adminMiddleware, updateUserHelpStatus); // Admin updates the status by token

module.exports = router;
