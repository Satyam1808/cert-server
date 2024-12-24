const VisualImages = require('../models/VisualGalleryModel'); // Import the Booklets model


exports.addVisualImages = async (req, res) => {
  const { imageTitle } = req.body;
  const {imageURL} = req.body;
  const {imageDesc} = req.body;
  const imageFile = req.file;
  const {galleryType}  = req.body;

  if (!imageTitle || !imageFile ||!galleryType) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
  
    const imageFilePath = imageFile.path.replace(/\\/g, '/');

    // Create a new Booklet document, including the admin reference
    const newVisualImage = new VisualImages({
        imageTitle,
        imageURL,
        imageDesc,
        galleryType,
        images: imageFilePath,
      admin: req.admin._id, // Set the admin reference here
    });

    await newVisualImage.save();

    const savedVisualImage = await VisualImages.findById(newVisualImage._id).populate('admin', 'name');

    res.status(201).json({
      message: 'Image added successfully',
      visualImages: savedVisualImage,
    });
  } catch (error) {
    console.error('Error adding Image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Controller method to update visibility
exports.updateVisibility = async (req, res) => {
  try {
    const imageId = req.params.id;
    const { visibility } = req.body; // Expecting visibility to be a boolean

    // Update the visibility field in the database
    const updatedImage = await VisualImages.findByIdAndUpdate(
      imageId,
      { visible: visibility }, // Assuming you have a 'visible' field in your schema
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.status(200).json({ message: 'Visibility updated successfully', updatedImage });
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

