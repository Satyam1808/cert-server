const express = require('express');
const router = express.Router();
const { checkPasswordStrength } = require('../controller/passwordController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

router.post('/strength',userAuthMiddleware, checkPasswordStrength);

module.exports = router;
