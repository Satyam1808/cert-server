const express = require('express');
const router = express.Router();
const { registerForEvent, verifyEventOtp ,getRegisteredEvents ,getRegisteredEventsForAdmin} = require('../controller/RegisterForEventController');
const authenticateJWT = require('../middlewares/userAuthMiddleware'); // JWT middleware
const adminAuthMiddleware = require('../middlewares/authMiddleware');

router.post('/register-event', authenticateJWT, registerForEvent);

router.post('/register-event-verify-otp',authenticateJWT, verifyEventOtp);

router.get('/registered-events', authenticateJWT, getRegisteredEvents);
router.get('/admin/all-registered-events', adminAuthMiddleware, getRegisteredEventsForAdmin);

module.exports = router;
