const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/Jwt'); // JWT secret from config
require('dotenv').config();

// Middleware to authenticate and attach admin to the request
const authenticateAdmin = async (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer token format

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, config.JWT_SECRET || process.env.JWT_SECRET);

    // Fetch the admin by the ID in the token payload
    const adminId = decoded.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Attach the admin object to the request for further use
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    // Handle token verification errors (expired, invalid, etc.)
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
