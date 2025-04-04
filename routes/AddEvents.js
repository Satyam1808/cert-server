const express = require('express');
const addEventsController = require('../controller/AddEventsController');
const router = express.Router();
const Events = require('../models/Event');
const authenticateAdmin = require('../middlewares/authMiddleware');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

router.post('/add-events', authenticateAdmin, addEventsController.addEvents);

router.get('/events', authenticateAdmin, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let query = {};
    if (search) {
      query = {
        $or: [
          { eventTitle: { $regex: search, $options: 'i' } },
          { 'admin.name': { $regex: search, $options: 'i' } },
        ],
      };
    }

    const totalEvents = await Events.countDocuments(query);
    const events = await Events.find(query)
      .populate('admin', 'name')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .exec();

    const eventsWithUrls = events.map(event => ({
      ...event.toObject()
    }));

    res.status(200).json({
      events: eventsWithUrls,
      totalPages: Math.ceil(totalEvents / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/all-events', authenticateAdmin, async (req, res) => {
  try {
    const events = await Events.find().populate('admin', 'name');
    const eventsWithUrls = events.map((event) => ({
      ...event.toObject(),
    }));

    res.status(200).json(eventsWithUrls);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/app/all-events', userAuthMiddleware, async (req, res) => {
  try {
    const events = await Events.find().populate('admin', 'name');
    const eventsWithUrls = events.map((event) => ({
      ...event.toObject(),
    }));

    res.status(200).json(eventsWithUrls);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Events.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event from database' });
  }
});

router.put('/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.eventTitle = req.body.eventTitle || event.eventTitle;
    event.eventDate = req.body.eventDate || event.eventDate;
    event.eventLocation = req.body.eventLocation || event.eventLocation;
    event.eventStatus = req.body.eventStatus || event.eventStatus;
    event.targetAudience = req.body.targetAudience || event.targetAudience;

    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
});

module.exports = router;