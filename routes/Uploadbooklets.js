const express = require('express');
const upload = require('../middlewares/multerConfig');
const addBookletsController = require('../controller/AddBookletsController');
const router = express.Router();
const Booklets = require('../models/Booklets');
const fs = require('fs');
const path = require('path');
const authenticateAdmin = require('../middlewares/authMiddleware');

// Route to handle adding booklets (image and PDF)
router.post('/add-booklets', authenticateAdmin, upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), addBookletsController.addBooklets);

// Route to fetch all booklets with pagination and optional search functionality
router.get('/booklets', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;  // Get the page and limit from the request
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { bookletTitle: { $regex: search, $options: 'i' } },
          { 'admin.name': { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Fetch booklets with pagination
    const totalBooklets = await Booklets.countDocuments(query);
    const booklets = await Booklets.find(query)
      .populate('admin', 'name')
      .skip((pageNum - 1) * limitNum)  // Skip to the correct page
      .limit(limitNum);  // Limit the number of results per page
      

    const bookletsWithUrls = booklets.map((booklet) => ({
      ...booklet.toObject(),
      bookletPdf: `/${booklet.bookletPdf}`,
      images: booklet.images.map((img) => `/${img}`),
    }));

    res.status(200).json({
      booklets: bookletsWithUrls,
      totalPages: Math.ceil(totalBooklets / limitNum),  // Calculate total pages
      
    });
  } catch (error) {
    console.error('Error fetching booklets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/all-booklets', async (req, res) => {
  try {
    const booklets = await Booklets.find()
      .populate('admin', 'name');
    
    const bookletsWithUrls = booklets.map((booklet) => ({
      ...booklet.toObject(),
      bookletPdf: `${req.protocol}://${req.get('host')}/${booklet.bookletPdf}`,
      images: booklet.images.map((img) => `${req.protocol}://${req.get('host')}/${img}`),
    }));

    res.status(200).json(bookletsWithUrls);
  } catch (error) {
    console.error('Error fetching booklets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete a booklet
router.delete('/booklets/:id', authenticateAdmin, async (req, res) => {
  try {
    const booklet = await Booklets.findById(req.params.id);
    if (!booklet) {
      return res.status(404).json({ message: 'Booklet not found' });
    }

    // Function to delete a file and log an error if it fails
    const deleteFile = (filePath) => {
      const fullPath = path.join(__dirname, '..', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log(`Deleted file: ${fullPath}`);
        }
      });
    };

    // Delete the PDF and image files from the file system
    deleteFile(booklet.bookletPdf);
    booklet.images.forEach((image) => deleteFile(image));

    // Remove the booklet from the database
    await Booklets.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Booklet deleted successfully' });
  } catch (dbError) {
    console.error('Error deleting booklet from database:', dbError);
    res.status(500).json({ message: 'Error deleting booklet from database' });
  }
});


module.exports = router;
