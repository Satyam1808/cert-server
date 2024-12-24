const express = require('express');
const router = express.Router();
const authController = require('../controller/Authcontroller');
const authenticateJWT = require('../middlewares/userAuthMiddleware');
const adminAuthMiddleware = require('../middlewares/authMiddleware');
const { updateProfileImage, updateName, deleteProfileImage } = require('../controller/Authcontroller');
const upload = require('../middlewares/multerUploadProfileImg');
const User = require('../models/User');

// Register with OTP
router.post('/register', authController.register);

// Verify OTP
router.post('/verify-otp', authController.verifyOtp);

// Resend OTP
router.post('/resend-otp', authController.resendOtp);

// Login
router.post('/login', authController.login);

// Get Current User (Protected Route)
router.get('/current-user', authenticateJWT, authController.getCurrentUser);

router.get('/allUsers', adminAuthMiddleware, (req, res, next) => {
  
  next();
}, authController.getAllUsers);

router.get('/:userId', authController.getUserById);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Logout endpoint
router.post('/logout', authenticateJWT, async (req, res) => {
    try {
      // Simulate token invalidation on the client-side
      return res.status(200).json({ msg: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ msg: 'Server error during logout' });
    }
  });

// Route for updating profile image
router.patch('/profile-image', authenticateJWT, upload.single('profileImage'), updateProfileImage);

// Route for updating name
router.patch('/updateName', authenticateJWT, updateName);

// Route for deleting profile image
router.delete('/profile-image', authenticateJWT, deleteProfileImage);

module.exports = router;
