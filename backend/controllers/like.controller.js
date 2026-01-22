const likeModel = require('../models/like.model');
const imageModel = require('../models/image.model');
const ApiError = require('../utils/ApiError');

/**
 * Toggle like status
 * POST /api/likes/:imageId/toggle
 */
const toggleLike = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        // Check if image exists
        const image = await imageModel.findById(imageId);
        if (!image) {
            throw new ApiError(404, 'Image not found');
        }

        // Check if already liked
        const existingLike = await likeModel.findOne({
            user: userId,
            image: imageId
        });

        let isLiked = false;

        if (status === 'like') {
            if (existingLike) {
                // Already liked
                isLiked = true;
            } else {
                // Add like
                await likeModel.create({
                    user: userId,
                    image: imageId
                });
                isLiked = true;
            }
        } else if (status === 'unlike') {
            if (existingLike) {
                // Remove like
                await likeModel.findOneAndDelete({
                    user: userId,
                    image: imageId
                });
                isLiked = false;
            } else {
                // Already unliked
                isLiked = false;
            }
        } else {
            console.log('No status provided');
            // Toggle behavior if status is not provided
            if (existingLike) {
                // Remove like
                await likeModel.findOneAndDelete({
                    user: userId,
                    image: imageId
                });
                isLiked = false;
            } else {
                // Add like
                await likeModel.create({
                    user: userId,
                    image: imageId
                });
                isLiked = true;
            }
        }

        return res.status(200).json({
            success: true,
            message: isLiked ? 'Image liked' : 'Image unliked',
            payload: {
                isLiked
            }
        });
    }
    catch (error) {
        next(error);
    }
};

/**
 * Get all user liked images
 * GET /api/likes
 */
const getUserLikes = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const likes = await likeModel
            .find({ user: userId })
            .populate({
                path: 'image',
                select: 'originalName s3Url mimetype size createdAt'
            })
            .limit(Number(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await likeModel.countDocuments({ user: userId });

        return res.status(200).json({
            success: true,
            message: 'Likes retrieved successfully',
            payload: {
                likes,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};

module.exports = {
    toggleLike,
    getUserLikes
};
