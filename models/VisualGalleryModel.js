const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  imageTitle: { type: String, required: true },
  imageURL: { type: String },
  imageDesc: { type: String},
  galleryType:{type: String},
  visible: { type: Boolean, default: true }, 
  images: { type: String, required: true },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Reference to the Admin model
  },
}, { timestamps: { createdAt: 'createdAt' } });

const VisualGalleryImages = mongoose.model('VisualGalleryImages', galleryImageSchema);

module.exports = VisualGalleryImages;
