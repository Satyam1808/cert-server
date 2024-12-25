const express = require('express');
const upload = require('../middlewares/addVisualGalleryMulterConfig');
const addVisualGalleryController = require('../controller/AddVisualGalleryController');
const router = express.Router();
const VisualImages = require('../models/VisualGalleryModel');
const fs = require('fs');
const path = require('path');
const authenticateAdmin = require('../middlewares/authMiddleware');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Route to handle adding booklets (image and PDF)
router.post('/add-visual-images', authenticateAdmin,  upload.single('imageFile'), addVisualGalleryController.addVisualImages);

// Route to fetch all visual images with pagination
router.get('/visual-images', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
  
      const totalVisualGallery = await VisualImages.countDocuments();
      const vImages = await VisualImages.find()
        .populate('admin', 'name')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
  
      const imageWithUrls = vImages.map((vImage) => ({
        ...vImage.toObject(),
        image: vImage.images ? `${req.protocol}://${req.get('host')}/${vImage.images}` : null,
      }));
  
      res.status(200).json({
        vImages: imageWithUrls,
        totalPages: Math.ceil(totalVisualGallery / limitNum),
        currentPage: pageNum,
      });
    } catch (error) {
      console.error('Error fetching Images:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/app/visual-images',userAuthMiddleware, async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
  
      const totalVisualGallery = await VisualImages.countDocuments();
      const vImages = await VisualImages.find()
        .populate('admin', 'name')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
  
      const imageWithUrls = vImages.map((vImage) => ({
        ...vImage.toObject(),
        image: vImage.images ? `${req.protocol}://${req.get('host')}/${vImage.images}` : null,
      }));
  
      res.status(200).json({
        vImages: imageWithUrls,
        totalPages: Math.ceil(totalVisualGallery / limitNum),
        currentPage: pageNum,
      });
    } catch (error) {
      console.error('Error fetching Images:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Route to delete a visual image by ID
  router.delete('/visual-images/:id', async (req, res) => {
    try {
      const imageId = req.params.id;
      await VisualImages.findByIdAndDelete(imageId);
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Route to update the visibility of a visual image
router.put('/visual-images/:id/visibility', authenticateAdmin, addVisualGalleryController.updateVisibility);


module.exports = router;
