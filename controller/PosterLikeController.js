const PosterLike = require('../models/PosterLikeModel');
const VisualImages = require('../models/VisualGalleryModel');
const mongoose = require('mongoose');

const likePoster = async (req, res) => {
    const { posterId } = req.params;
    const { userId, liked } = req.body;

    try {
        console.log(`Received request to like/unlike poster. Poster ID: ${posterId}, User ID: ${userId}, Liked: ${liked}`);
        
        // Convert posterId to ObjectId type
        const posterIdObj = new mongoose.Types.ObjectId(posterId);

        // Find the poster in VisualGalleryImages to ensure it exists
        const poster = await VisualImages.findById(posterIdObj);
        if (!poster) {
            console.error(`Poster with ID ${posterId} not found.`);
            return res.status(404).send({ error: 'Poster not found' });
        }

        // Find the PosterLike entry or create one if it doesn't exist
        let posterLike = await PosterLike.findOne({ posterId: posterIdObj });
        if (!posterLike) {
            posterLike = new PosterLike({ posterId: posterIdObj, likes: [], likeCount: 0 });
        }

        if (liked) {
            // Add user to the likes array if they haven't liked it already
            if (!posterLike.likes.some(like => like.userId.toString() === userId)) {
                posterLike.likes.push({ userId });
                posterLike.likeCount++;
                console.log(`User ${userId} liked the poster. New like count: ${posterLike.likeCount}`);
            } else {
                console.log(`User ${userId} has already liked this poster.`);
            }
        } else {
            // Remove user from the likes array if they have already liked it
            const userIndex = posterLike.likes.findIndex(like => like.userId.toString() === userId);
            if (userIndex !== -1) {
                posterLike.likes.splice(userIndex, 1); // Remove the user from the likes array
                posterLike.likeCount--; // Decrement the like count
                console.log(`User ${userId} unliked the poster. New like count: ${posterLike.likeCount}`);
            } else {
                console.log(`User ${userId} was not in the like list.`);
            }
        }

        // Save the updated like information
        await posterLike.save();
        res.json({ success: true, likeCount: posterLike.likeCount });
    } catch (error) {
        console.error(`Error while processing like/unlike request. Error: ${error.message}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};



// Get Like Status
const getLikeStatus = async (req, res) => {
    const { posterId } = req.params;
    const { userId } = req.query;

    try {
        // Convert posterId to ObjectId
        const posterIdObj = new mongoose.Types.ObjectId(posterId);

        // Find the like status in PosterLike collection
        const posterLike = await PosterLike.findOne({ posterId: posterIdObj });
        if (!posterLike) {
            return res.status(404).send({ error: 'Poster not found or no likes available' });
        }

        const isLiked = posterLike.likes.some(like => like.userId.toString() === userId);
        res.json({ success: true, isLiked, likeCount: posterLike.likeCount });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


module.exports = { likePoster, getLikeStatus };
