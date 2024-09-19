const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const pdfTypes = /pdf/;
  const imageTypes = /jpeg|jpg|png/;
  const extname = pdfTypes.test(path.extname(file.originalname).toLowerCase()) || imageTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = pdfTypes.test(file.mimetype) || imageTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit
  }
});

module.exports = upload;
