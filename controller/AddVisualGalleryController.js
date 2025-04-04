const VisualImages = require('../models/VisualGalleryModel');

exports.addVisualImages = async (req, res) => {
  try {
    const { imageTitle, imageURL, imageDesc, galleryType } = req.body;
    const imageFile = req.file;

    if (!imageTitle || !imageFile || !galleryType) {
      return res.status(400).json({ message: 'Please provide all required fields: imageTitle, imageFile, and galleryType.' });
    }

    const imageFilePath = imageFile.path.replace(/\\/g, '/');

    const newVisualImage = new VisualImages({
      imageTitle: imageTitle.trim(),
      imageURL: imageURL ? imageURL.trim() : null,
      imageDesc: imageDesc ? imageDesc.trim() : null,
      galleryType: galleryType.trim(),
      images: imageFilePath,
      admin: req.admin._id,
    });

    await newVisualImage.save();

    const savedVisualImage = await VisualImages.findById(newVisualImage._id).populate('admin', 'name');

    res.status(201).json({
      message: 'Image added successfully',
      visualImages: savedVisualImage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateVisibility = async (req, res) => {
  try {
    const imageId = req.params.id;
    const { visibility } = req.body;

    if (typeof visibility !== 'boolean') {
      return res.status(400).json({ message: 'Invalid visibility value. It must be a boolean.' });
    }

    const updatedImage = await VisualImages.findByIdAndUpdate(
      imageId,
      { visible: visibility },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.status(200).json({ message: 'Visibility updated successfully', updatedImage });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};