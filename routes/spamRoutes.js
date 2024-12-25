const express = require('express');
const { predictMessage, submitFeedback } = require('../controller/spamController');
const router = express.Router();
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

router.post('/predict',userAuthMiddleware, predictMessage);
router.post('/feedback', userAuthMiddleware, submitFeedback);

module.exports = router;
