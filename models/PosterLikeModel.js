const mongoose = require('mongoose');

const posterLikeSchema = new mongoose.Schema({
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisualGalleryImages', required: true, unique: true }, // Link to VisualGalleryImages
    likes: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }], // Store user IDs who liked the poster
    likeCount: { type: Number, default: 0 } // Total count of likes
});

const PosterLike = mongoose.model('PosterLike', posterLikeSchema);
module.exports = PosterLike;
