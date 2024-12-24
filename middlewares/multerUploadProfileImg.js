const multer = require('multer');
const path = require('path');

// Set up multer storage for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/ProfileImages');  // Store images in this folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));  // Generate unique filename
    }
});



const upload = multer({ storage: storage });

module.exports = upload;
