const express = require('express');
const upload = require('../middlewares/multerConfig');
const addBookletsController = require('../controller/AddBookletsController');
const router = express.Router();
const Booklets = require('../models/Booklets');
const fs = require('fs');
const path = require('path');
const authenticateAdmin = require('../middlewares/authMiddleware');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

router.post('/add-booklets', authenticateAdmin, upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), addBookletsController.addBooklets);

router.get('/booklets',authenticateAdmin, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;  
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
    const totalBooklets = await Booklets.countDocuments(query);
    const booklets = await Booklets.find(query)
      .populate('admin', 'name')
      .skip((pageNum - 1) * limitNum)  
      .limit(limitNum); 
      

      const bookletsWithUrls = booklets.map((booklet) => ({
        ...booklet.toObject(),
        bookletPdf: booklet.bookletPdf
            ? `${req.protocol}://${req.get('host')}/${booklet.bookletPdf}`
            : null,
        images: booklet.images
            ? booklet.images.map((img) => `${req.protocol}://${req.get('host')}/${img}`)
            : null,
    }));
    

    res.status(200).json({
      booklets: bookletsWithUrls,
      totalPages: Math.ceil(totalBooklets / limitNum),  
      
    });
  } catch (error) {
    console.error('Error fetching booklets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/all-booklets',authenticateAdmin, async (req, res) => {
  try {
    const booklets = await Booklets.find()
      .populate('admin', 'name');
    
      const bookletsWithUrls = booklets.map((booklet) => ({
        ...booklet.toObject(),
        bookletPdf: booklet.bookletPdf
            ? `${booklet.bookletPdf}`
            : null,
        images: booklet.images
            ? booklet.images.map((img) => `${img}`)
            : null,
    }));
    

    res.status(200).json(bookletsWithUrls);
  } catch (error) {
    console.error('Error fetching booklets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/app/all-booklets', userAuthMiddleware, async (req, res) => {
  try {
    const booklets = await Booklets.find()
      .populate('admin', 'name');
    
      const bookletsWithUrls = booklets.map((booklet) => ({
        ...booklet.toObject(),
        bookletPdf: booklet.bookletPdf
            ? `${booklet.bookletPdf}`
            : null,
        images: booklet.images
            ? booklet.images.map((img) => `${img}`)
            : null,
    }));
    

    res.status(200).json(bookletsWithUrls);
  } catch (error) {
    console.error('Error fetching booklets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/booklets/:id', authenticateAdmin, async (req, res) => {
  try {
    const booklet = await Booklets.findById(req.params.id);
    if (!booklet) {
      return res.status(404).json({ message: 'Booklet not found' });
    }

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

    deleteFile(booklet.bookletPdf);
    booklet.images.forEach((image) => deleteFile(image));

    await Booklets.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Booklet deleted successfully' });
  } catch (dbError) {
    console.error('Error deleting booklet from database:', dbError);
    res.status(500).json({ message: 'Error deleting booklet from database' });
  }
});


module.exports = router;
