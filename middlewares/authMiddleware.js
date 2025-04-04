const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/Jwt');
require('dotenv').config();

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET || process.env.JWT_SECRET);
    const adminId = decoded.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = authenticateAdmin;