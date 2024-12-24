const express = require('express');
const { predictMessage, submitFeedback } = require('../controller/spamController');
const router = express.Router();

router.post('/predict', predictMessage);
router.post('/feedback', submitFeedback);

module.exports = router;
