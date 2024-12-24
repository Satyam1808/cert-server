const mongoose = require('mongoose');

const bookletsSchema = new mongoose.Schema({
  bookletTitle: { type: String, required: true },
  bookletPdf: { type: String, required: true }, // Ensuring this is required
  images: [{ type: String, required: true }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Reference to the Admin model
  },
}, { timestamps: { createdAt: 'createdAt' } });

const Booklets = mongoose.model('Booklets', bookletsSchema);

module.exports = Booklets;
