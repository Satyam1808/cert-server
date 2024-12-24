const UserHelpModel = require('../models/UserHelpAndSupportModel');
const Joi = require('joi');

// Input Validation Schema
const userHelpSchema = Joi.object({
  userID: Joi.string().pattern(/^[a-f\d]{24}$/i).required(), // Validate as a MongoDB ObjectId
  userName: Joi.string().min(3).max(30).required(),
  emailID: Joi.string().email().required(),
  message: Joi.string().min(10).max(500).required(),
});

exports.createUserHelp = async (req, res) => {
  try {
    // Validate incoming data
    const { error } = userHelpSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { userID, userName, emailID, message } = req.body;

    // Save to the database
    const newUserHelp = new UserHelpModel({ userID, userName, emailID, message });
    await newUserHelp.save();

    res.status(201).json({ message: 'Help message submitted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};