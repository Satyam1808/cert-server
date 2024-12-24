const Events = require('../models/Event');

exports.addEvents = async (req, res) => {

  console.log('Request Body:', req.body);  // Log the body
  console.log('Admin:', req.admin);        // Log the admin

  const { eventTitle, targetAudience, eventDate, eventLocation, eventStatus } = req.body; // Match fields here


  if (!eventTitle || !targetAudience|| !eventDate || !eventLocation || !eventStatus) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    
    // Create a new event
    const newEvent = new Events({
      eventTitle,
      targetAudience,
      eventDate,
      eventLocation, // Correct field
      eventStatus,
      admin: req.admin._id, // Set by your auth middleware
    });

    await newEvent.save();

    const savedEvent = await Events.findById(newEvent._id).populate('admin', 'name');

    res.status(201).json({
      message: 'Event added successfully',
      event: savedEvent,
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
