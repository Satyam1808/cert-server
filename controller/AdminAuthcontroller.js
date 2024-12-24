const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/Jwt');
const { check, validationResult } = require('express-validator');

// Registration Endpoint
exports.register = [
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
      let admin = await Admin.findOne({ email });

      if (admin) {
        return res.status(400).json({ msg: 'Admin already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      admin = new Admin({
        name,
        email,
        mobile,
        password: hashedPassword
      });

      await admin.save();

      const payload = {
        user: {
          id: admin.id,
        },
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

      res.status(201).json({ token });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
];

// Login Endpoint
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: admin.id,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


// Forgot Password Endpoint
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(400).json({ msg: 'Admin does not exist' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetToken = resetToken;
    admin.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration
    await admin.save();

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

// Reset Password Endpoint
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const admin = await Admin.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetToken = undefined;
    admin.resetTokenExpiration = undefined;
    await admin.save();

    res.status(200).json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
