const express = require('express');
const router = express.Router();
const posterController = require('../controller/PosterLikeController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

router.post('/:posterId/like', posterController.likePoster,userAuthMiddleware);
router.get('/:posterId/like', posterController.getLikeStatus,userAuthMiddleware);




module.exports = router;
