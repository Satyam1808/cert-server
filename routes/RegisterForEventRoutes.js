const express = require('express');
const router = express.Router();
const { registerForEvent, verifyEventOtp ,getRegisteredEvents } = require('../controller/RegisterForEventController');
const authenticateJWT = require('../middlewares/userAuthMiddleware'); // JWT middleware

// POST route for event registration
router.post('/register-event', authenticateJWT, registerForEvent);

// POST route for OTP verification
router.post('/register-event-verify-otp', verifyEventOtp);

// GET route for fetching registered events for the authenticated user
router.get('/registered-events', authenticateJWT, getRegisteredEvents);

module.exports = router;
