const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
  eventTitle: { type: String, required: true },
  targetAudience: { type: String, required: true }, // Changed to "required"
  eventDate: { type: String, required: true },
  eventLocation: { type: String, required: true }, // Changed to "eventLocation"
  eventStatus: { type: String, required: true },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Ensure you have an Admin model
  },
}, { timestamps: { createdAt: 'createdAt' } });

const Events = mongoose.model('Events', eventsSchema);

module.exports = Events;
