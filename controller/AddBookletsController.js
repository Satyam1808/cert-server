const Booklets = require('../models/Booklets');
const Admin = require('../models/Admin');

exports.addBooklets = async (req, res) => {
  const { bookletTitle } = req.body;
  const { pdfFile, imageFile } = req.files;

  if (!bookletTitle || !pdfFile || !imageFile) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
  


    // Create a new Booklet document
    const newBooklet = new Booklets({
      bookletTitle,
      bookletPdf: pdfFile[0].path,
      images: [imageFile[0].path],
    
    });

    // Save the new booklet to the database
    await newBooklet.save();

    // Populate admin details for response
    const savedBooklet = await Booklets.findById(newBooklet._id).populate('admin', 'name');

    // Respond with the saved booklet and admin details
    res.status(201).json({
      message: 'Booklet added successfully',
      booklet: savedBooklet
    });
  } catch (error) {
    console.error('Error adding booklet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
