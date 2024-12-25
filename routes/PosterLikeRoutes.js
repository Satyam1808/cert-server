const express = require('express');
const router = express.Router();
const posterController = require('../controller/PosterLikeController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');



// Like/Unlike Poster Route
router.post('/:posterId/like', posterController.likePoster,userAuthMiddleware);

// Get Like Status Route (GET)
router.get('/:posterId/like', posterController.getLikeStatus,userAuthMiddleware);




module.exports = router;
