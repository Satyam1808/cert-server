const express = require('express');
const router = express.Router();
const {createUserHelp, getAllUserHelpQueries, updateUserHelpStatus} = require('../controller/UserHelpController');
const authMiddleware = require('../middlewares/userAuthMiddleware');
const adminMiddleware = require('../middlewares/authMiddleware');

router.post('/submit',authMiddleware, createUserHelp);
router.get('/queries', adminMiddleware, getAllUserHelpQueries);
router.put('/status/:token',adminMiddleware, updateUserHelpStatus); 

module.exports = router;
