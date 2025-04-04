const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { JWT_SECRET } = require('../config/Jwt');
const crypto = require('crypto');
const path = require("path");
const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

const otpStore = new Map();
const loginAttempts = new Map();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


exports.register = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Invalid email address'),
  check('mobile').isLength({ min: 10, max: 10 }).isNumeric().withMessage('Mobile number must be 10 digits'),
  check('password')
    .matches(/.*[a-zA-Z].*/).withMessage('Password must contain at least one letter')
    .matches(/.*\d.*/).withMessage('Password must contain at least one number'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile, password } = req.body;

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      let user = await User.findOne({ email: sanitizedEmail });

      if (user) {
        return res.status(200).json({ msg: 'User already exists', userExists: true });
      }

      const otp = otpGenerator.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const hashedPassword = await bcrypt.hash(password, 12);

      otpStore.set(sanitizedEmail, {
        otp,
        expiresAt: Date.now() + 60000,
        userData: { name, email: sanitizedEmail, mobile, password: hashedPassword },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: sanitizedEmail,
        subject: 'Your OTP Code for CERT-In',
        text: `Your OTP code is ${otp}. It is valid for 1 minute.`,
      });

      res.status(200).json({ msg: 'OTP sent successfully', userExists: false });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  },
];


exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const sanitizedEmail = email.trim().toLowerCase();

  const storedOtpData = otpStore.get(sanitizedEmail);

  if (!storedOtpData) {
    return res.status(400).json({ msg: 'Invalid OTP or expired' });
  }

  const { otp: storedOtp, expiresAt, userData } = storedOtpData;

  if (Date.now() > expiresAt) {
    otpStore.delete(sanitizedEmail);
    return res.status(400).json({ msg: 'OTP has expired' });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ msg: 'Invalid OTP. Please try again' });
  }

  const { name, mobile, password } = userData;

  let existingUser = await User.findOne({ email: sanitizedEmail });
  const profileImage = "";

  if (existingUser) {
    otpStore.delete(sanitizedEmail);
    return res.status(400).json({ msg: 'User already exists' });
  }

  const newUser = new User({ name, email: sanitizedEmail, mobile, profileImage, password });
  await newUser.save();

  otpStore.delete(sanitizedEmail);

  const token = jwt.sign(
    {
      userId: newUser.id,
      name: newUser.name,
      emailId: newUser.email,
      mobile: newUser.mobile,
      profileImage: newUser.profileImage,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(200).json({ token });
};


exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const storedOtpData = otpStore.get(email);

  if (storedOtpData && Date.now() < storedOtpData.expiresAt) {
    return res.status(400).json({ msg: 'Please wait until the current OTP expires' });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists', userExists: true });
    }

    const otp = otpGenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    const { name, mobile, password } = storedOtpData ? storedOtpData.userData : req.body; // Adjust based on how you pass user data

    otpStore.set(email, { 
      otp, 
      expiresAt: Date.now() + 60000, 
      userData: { name, email, mobile, password } 
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your new OTP Code for CERT-In',
      text: `Your new OTP code is ${otp}. It is valid for 1 minute.`
    });

    res.status(200).json({ msg: 'New OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const sanitizedEmail = email.trim().toLowerCase();

  try {
    if (!sanitizedEmail || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(400).json({ msg: 'Email is not registered' });
    }

    const loginAttemptData = loginAttempts.get(sanitizedEmail) || { attempts: 0, lockedUntil: 0 };

  
    if (loginAttemptData.lockedUntil > Date.now()) {
      const timeLeft = Math.ceil((loginAttemptData.lockedUntil - Date.now()) / 1000);
      return res.status(400).json({ msg: `Too many failed attempts. Try again in ${timeLeft} seconds.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const newAttempts = loginAttemptData.attempts + 1;

      if (newAttempts >= 3) {
        loginAttempts.set(sanitizedEmail, { attempts: 3, lockedUntil: Date.now() + 5 * 60 * 1000 });
        return res.status(400).json({ msg: 'Too many failed attempts. Try again in 5 minutes.' });
      }

      loginAttempts.set(sanitizedEmail, { attempts: newAttempts, lockedUntil: 0 });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    

    
    loginAttempts.delete(sanitizedEmail);

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        emailId: user.email,
        mobile: user.mobile,
        profileImage: user.profileImage,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords

    if (!users || users.length === 0) {
      return res.status(404).json({ msg: 'No users found' });
    }

    res.json({
      message: 'Users fetched successfully',
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params; 
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }

    const user = await User.findById(userId).select('-password'); 

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = email.toLowerCase(); 
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `https://cert-in-app/reset-password?token=${resetToken}`;


    const htmlContent = `
      <p>You have requested to reset your password. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Password Reset',
      html: htmlContent 
    });

    res.status(200).json({ msg: 'Reset link sent to email' });
  } catch (err) {
    console.error('ForgotPassword Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfileImage = async (req, res) => {
  const { userId } = req.user;

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      if (!req.file) {
          return res.status(400).json({ msg: 'No image file uploaded' });
      }
      if (user.profileImage) {
          const oldImagePath = path.join(__dirname, '..', user.profileImage);
          if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
          }
      }

      const fileName = req.file.filename;
      user.profileImage = `uploads/ProfileImages/${fileName}`;
      await user.save();

      res.status(200).json({
          message: 'Profile image updated successfully!',
          profileImage: user.profileImage,
      });
  } catch (err) {
      console.error('Error updating profile image:', err);
      res.status(500).json({ msg: 'Server error while updating profile image' });
  }
};

exports.updateName = async (req, res) => {
  const { userId } = req.user; 
  const { name } = req.body;

  if (!name) {
      return res.status(400).json({ msg: 'Name is required', body: req.body });
  }

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      user.name = name;
      await user.save();

      res.status(200).json({
          message: 'Name updated successfully!',
          name: user.name,
      });
  } catch (err) {
      console.error('Error updating name:', err);
      res.status(500).json({ msg: 'Server error while updating name' });
  }
};


exports.deleteProfileImage = async (req, res) => {
  const { userId } = req.user;

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      if (user.profileImage) {
          const imagePath = path.join(__dirname, '..', user.profileImage);
          if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
          }
          user.profileImage = null;
          await user.save();
      }

      res.status(200).json({ message: 'Profile image deleted successfully!' });
  } catch (err) {
      console.error('Error deleting profile image:', err);
      res.status(500).json({ msg: 'Server error while deleting profile image' });
  }
};

