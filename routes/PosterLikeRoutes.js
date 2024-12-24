const express = require('express');
const router = express.Router();
const posterController = require('../controller/PosterLikeController');



// Like/Unlike Poster Route
router.post('/:posterId/like', posterController.likePoster);

// Get Like Status Route (GET)
router.get('/:posterId/like', posterController.getLikeStatus);




module.exports = router;
