const express = require('express');
const router = express.Router();
const authController = require('../controller/Authcontroller');
const authenticateJWT = require('../middlewares/userAuthMiddleware');
const adminAuthMiddleware = require('../middlewares/authMiddleware');
const { updateProfileImage, updateName, deleteProfileImage } = require('../controller/Authcontroller');
const upload = require('../middlewares/multerUploadProfileImg');

router.post('/register', authController.register);

router.post('/verify-otp', authController.verifyOtp);

router.post('/resend-otp', authController.resendOtp);

router.post('/login', authController.login);

router.get('/current-user', authenticateJWT, authController.getCurrentUser);

router.get('/allUsers', adminAuthMiddleware, (req, res, next) => {
  
  next();
}, authController.getAllUsers);

router.get('/:userId',authenticateJWT, authController.getUserById);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/logout', authenticateJWT, async (req, res) => {
    try {
      return res.status(200).json({ msg: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ msg: 'Server error during logout' });
    }
  });
router.patch('/profile-image', authenticateJWT, upload.single('profileImage'), updateProfileImage);

router.patch('/updateName', authenticateJWT, updateName);

router.delete('/profile-image', authenticateJWT, deleteProfileImage);

module.exports = router;
