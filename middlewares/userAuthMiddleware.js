const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/Jwt');

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization')?.split(' ')[1];

  // If no token is found, return an error response
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token with the secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to the request object
    req.user = decoded;

    // Proceed to the next middleware/route handler
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
