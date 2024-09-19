const express = require('express');
const upload = require('../middlewares/multerConfig'); // Import the multer config
const addBookletsController = require('../controller/AddBookletsController');
const router = express.Router();
const Booklets = require('../models/Booklets');

// Route to handle both image and PDF upload (protected with admin authentication)
router.post('/add-booklets', upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), addBookletsController.addBooklets);
router.get('/booklets', async (req, res) => {
  try {
    const booklets = await Booklets.find()
      .populate('admin', 'name') // Populate the admin's name
      .exec();

    res.status(200).json({ booklets });
  } catch (error) {
    console.error('Error fetching booklets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
