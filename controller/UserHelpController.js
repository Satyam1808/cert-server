const UserHelpModel = require('../models/UserHelpAndSupportModel');
const Joi = require('joi');

const userHelpSchema = Joi.object({
  userID: Joi.string().pattern(/^[a-f\d]{24}$/i).required(),
  userName: Joi.string().min(3).max(30).required(),
  emailID: Joi.string().email().required(),
  message: Joi.string().min(10).max(500).required(),
});

exports.createUserHelp = async (req, res) => {
  try {
    const { error } = userHelpSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { userID, userName, emailID, message } = req.body;

    const newUserHelp = new UserHelpModel({ userID, userName, emailID, message });
    await newUserHelp.save();

    res.status(201).json({
      message: 'Help message submitted successfully',
      token: newUserHelp.token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllUserHelpQueries = async (req, res) => {
  try {
    const userHelpQueries = await UserHelpModel.find();

    if (!userHelpQueries || userHelpQueries.length === 0) {
      return res.status(404).json({ error: 'No queries found' });
    }

    res.status(200).json({
      queries: userHelpQueries,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateUserHelpStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedQuery = await UserHelpModel.findOneAndUpdate(
      { token },
      { status },
      { new: true }
    );

    if (!updatedQuery) {
      return res.status(404).json({ error: 'Query not found' });
    }

    res.status(200).json({
      message: 'Query status updated successfully',
      status: updatedQuery.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};