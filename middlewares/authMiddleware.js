const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Adjust the path as needed
const config = require('../config/Jwt'); // Load the JWT secret from config

const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET); // Use JWT_SECRET from config
    const admin = await Admin.findById(decoded.id); // Find the admin by ID

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    req.admin = admin; // Attach the admin to the request object
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateAdmin;
