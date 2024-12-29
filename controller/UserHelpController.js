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

    // Save to the database with unique token and default status
    const newUserHelp = new UserHelpModel({ userID, userName, emailID, message });
    await newUserHelp.save();

    res.status(201).json({
      message: 'Help message submitted successfully',
      token: newUserHelp.token, // Send the 10-digit unique token back in the response
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get all user help queries
exports.getAllUserHelpQueries = async (req, res) => {
  try {
    // Get all queries from the database
    const userHelpQueries = await UserHelpModel.find();

    if (!userHelpQueries || userHelpQueries.length === 0) {
      return res.status(404).json({ error: 'No queries found' });
    }

    res.status(200).json({
      queries: userHelpQueries, // Return all the queries with their details
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update the help query status by token (for admin)
exports.updateUserHelpStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find the query by token and update the status
    const updatedQuery = await UserHelpModel.findOneAndUpdate(
      { token },
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedQuery) {
      return res.status(404).json({ error: 'Query not found' });
    }

    res.status(200).json({
      message: 'Query status updated successfully',
      status: updatedQuery.status,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
