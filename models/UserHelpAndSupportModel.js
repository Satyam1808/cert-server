const mongoose = require('mongoose');

// Function to generate a 10-digit numeric token
const generateToken = () => {
  const timestamp = Date.now(); // Get the current timestamp (milliseconds)
  const randomDigits = Math.floor(Math.random() * 100000); // Random number between 0 and 99999
  const token = (timestamp % 10000000000) + randomDigits; // Combine timestamp and random number to get a 10-digit token
  return token.toString().padStart(10, '0'); // Ensure the token is exactly 10 digits
};

const userHelpSchema = new mongoose.Schema({
  userID: { type: String, required: true, trim: true },
  userName: { type: String, required: true, trim: true },
  emailID: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  token: { type: String, default: generateToken }, // Use the function to generate the token
  status: { type: String, enum: ['open', 'closed'], default: 'open' }, // Status field
}, { timestamps: true });

module.exports = mongoose.model('UserHelp', userHelpSchema);
