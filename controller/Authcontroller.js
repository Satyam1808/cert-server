const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { JWT_SECRET } = require('../config/Jwt');
const crypto = require('crypto');
require('dotenv').config();
const { check, validationResult } = require('express-validator');

// Temporary store for OTPs and user details
const otpStore = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Registration Endpoint
exports.register = [
  // Validate inputs
  check('email').isEmail().withMessage('Invalid email address'),
  check('mobile').isLength({ min: 10, max: 10 }).isNumeric().withMessage('Mobile number must be 10 digits'),
  check('password').matches(/.*[a-zA-Z].*/).withMessage('Password must contain at least one letter')
    .matches(/.*\d.*/).withMessage('Password must contain at least one number'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(200).json({ msg: 'User already exists', userExists: true });
      }

      const otp = otpGenerator.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      // Store OTP with timestamp for validity check (1 minute = 60000 ms)
      otpStore.set(email, { 
        otp, 
        expiresAt: Date.now() + 60000, // OTP is valid for 1 minute
        userData: { name, email, mobile, password: hashedPassword } 
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code for CERT-In',
        text: `Your OTP code is ${otp}. It is valid for 1 minute.`
      });

      res.status(200).json({ msg: 'OTP sent successfully', userExists: false });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
];


// OTP Verification Endpoint
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const storedOtpData = otpStore.get(email);

  if (!storedOtpData) {
    return res.status(400).json({ msg: 'Invalid OTP or expired' });
  }

  const { otp: storedOtp, expiresAt, userData } = storedOtpData;

  // Check if OTP is valid and not expired
  if (storedOtp !== otp || Date.now() > expiresAt) {
    return res.status(400).json({ msg: 'Invalid OTP or expired' });
  }

  try {
    const { name, mobile, password } = userData;

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const newUser = new User({ name, email, mobile, password });
    await newUser.save();

    otpStore.delete(email); // Remove OTP after successful verification

    res.status(200).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


// Resend OTP Endpoint
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const storedOtpData = otpStore.get(email);

  if (storedOtpData && Date.now() < storedOtpData.expiresAt) {
    return res.status(400).json({ msg: 'Please wait until the current OTP expires' });
  }

  try {
    const otp = otpGenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    otpStore.set(email, { 
      otp, 
      expiresAt: Date.now() + 60000, // OTP is valid for 1 minute
      userData: storedOtpData.userData 
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your new OTP Code for CERT-In',
      text: `Your new OTP code is ${otp}. It is valid for 1 minute.`
    });

    res.status(200).json({ msg: 'New OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


// Login Endpoint
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Forgot Password Endpoint
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = email.toLowerCase(); // Normalize email before query
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Create the reset URL
    const resetUrl = `https://cert-in-app/reset-password?token=${resetToken}`;



    // HTML content for the email
    const htmlContent = `
      <p>You have requested to reset your password. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Send the email with the reset link
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Password Reset',
      html: htmlContent // Send HTML content instead of plain text
    });

    res.status(200).json({ msg: 'Reset link sent to email' });
  } catch (err) {
    console.error('ForgotPassword Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


// Reset Password Endpoint
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


