const express = require('express');
const router = express.Router();
const { registerForEvent, verifyEventOtp ,getRegisteredEvents ,getRegisteredEventsForAdmin} = require('../controller/RegisterForEventController');
const authenticateJWT = require('../middlewares/userAuthMiddleware'); // JWT middleware
const adminAuthMiddleware = require('../middlewares/authMiddleware');

// POST route for event registration
router.post('/register-event', authenticateJWT, registerForEvent);

// POST route for OTP verification
router.post('/register-event-verify-otp', verifyEventOtp);

// GET route for fetching registered events for the authenticated user
router.get('/registered-events', authenticateJWT, getRegisteredEvents);
router.get('/admin/all-registered-events', adminAuthMiddleware, getRegisteredEventsForAdmin);

module.exports = router;
