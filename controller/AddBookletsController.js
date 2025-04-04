const Booklets = require('../models/Booklets'); 

exports.addBooklets = async (req, res) => {
  const { bookletTitle } = req.body;
  const { pdfFile, imageFile } = req.files;

  if (!bookletTitle || !pdfFile || !imageFile) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const pdfFilePath = pdfFile[0].path.replace(/\\/g, '/');
    const imageFilePath = imageFile[0].path.replace(/\\/g, '/');

    const newBooklet = new Booklets({
      bookletTitle,
      bookletPdf: pdfFilePath,
      images: [imageFilePath],
      admin: req.admin._id, 
    });

    await newBooklet.save();

    const savedBooklet = await Booklets.findById(newBooklet._id).populate('admin', 'name');

    res.status(201).json({
      message: 'Booklet added successfully',
      booklet: savedBooklet,
    });
  } catch (error) {
    console.error('Error adding booklet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
