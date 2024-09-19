const mongoose = require('mongoose');

// Update the schema to include admin reference
const bookletsSchema = new mongoose.Schema({
  bookletTitle: String,
  bookletPdf: String,
  images: [String],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin' // Ensure this matches your Admin model
  }
}, { timestamps: { createdAt: 'createdAt' } });

const Booklets = mongoose.model('Booklets', bookletsSchema);

module.exports = Booklets;
