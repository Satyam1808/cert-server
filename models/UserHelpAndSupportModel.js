const mongoose = require('mongoose');

const userHelpSchema = new mongoose.Schema({
  userID: { type: String, required: true, trim: true },
  userName: { type: String, required: true, trim: true },
  emailID: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('UserHelp', userHelpSchema);
