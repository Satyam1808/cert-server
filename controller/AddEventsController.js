const Events = require('../models/Event');

exports.addEvents = async (req, res) => {
  

  const { eventTitle, targetAudience, eventDate, eventLocation, eventStatus } = req.body; 


  if (!eventTitle || !targetAudience|| !eventDate || !eventLocation || !eventStatus) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {

    const newEvent = new Events({
      eventTitle,
      targetAudience,
      eventDate,
      eventLocation, 
      eventStatus,
      admin: req.admin._id, 
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
