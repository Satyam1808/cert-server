const PosterLike = require('../models/PosterLikeModel');
const VisualImages = require('../models/VisualGalleryModel');
const mongoose = require('mongoose');

const likePoster = async (req, res) => {
    const { posterId } = req.params;
    const { userId, liked } = req.body;

    try {
        const posterIdObj = new mongoose.Types.ObjectId(posterId);
        const poster = await VisualImages.findById(posterIdObj);
        if (!poster) {
            return res.status(404).send({ error: 'Poster not found' });
        }

        let posterLike = await PosterLike.findOne({ posterId: posterIdObj });
        if (!posterLike) {
            posterLike = new PosterLike({ posterId: posterIdObj, likes: [], likeCount: 0 });
        }

        if (liked) {
            if (!posterLike.likes.some(like => like.userId.toString() === userId)) {
                posterLike.likes.push({ userId });
                posterLike.likeCount++;
            }
        } else {
            const userIndex = posterLike.likes.findIndex(like => like.userId.toString() === userId);
            if (userIndex !== -1) {
                posterLike.likes.splice(userIndex, 1);
                posterLike.likeCount--;
            }
        }

        await posterLike.save();
        res.json({ success: true, likeCount: posterLike.likeCount });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const getLikeStatus = async (req, res) => {
    const { posterId } = req.params;
    const { userId } = req.query;

    try {
        const posterIdObj = new mongoose.Types.ObjectId(posterId);
        const posterLike = await PosterLike.findOne({ posterId: posterIdObj });
        if (!posterLike) {
            return res.status(404).send({ error: 'Poster not found or no likes available' });
        }

        const isLiked = posterLike.likes.some(like => like.userId.toString() === userId);
        res.json({ success: true, isLiked, likeCount: posterLike.likeCount });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

module.exports = { likePoster, getLikeStatus };