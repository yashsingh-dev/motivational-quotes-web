const userModel = require('../models/user.model');
const imageModel = require('../models/image.model');
const socialMediaModel = require('../models/socialMedia.model');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const likeModel = require('../models/like.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const { secureHash } = require('../utils/crypto.utils');


const getSocialMediaLinks = async (req, res, next) => {
    try {
        const links = await socialMediaModel.find().sort({ platform: 1 });

        // If no links exist, create default ones
        if (links.length === 0) {
            const platforms = ['youtube', 'instagram', 'facebook', 'threads'];
            const defaultLinks = await socialMediaModel.insertMany(
                platforms.map(platform => ({ platform, url: '' }))
            );
            return res.status(200).json({
                success: true,
                message: 'Social media links retrieved successfully',
                payload: defaultLinks
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Social media links retrieved successfully',
            payload: links
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id).select('-password');

        if (!user) {
            throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
        }

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            payload: user
        });
    }
    catch (error) {
        next(error);
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const userId = req.user._id;

        if (!password) {
            throw new ApiError(400, 'Password is required');
        }

        if (password.length < 6) {
            throw new ApiError(400, 'Password must be at least 6 characters long');
        }

        // Update password directly
        await userModel.findByIdAndUpdate(
            userId,
            { password: password },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const getRandomImages = async (req, res, next) => {
    try {
        const { seenIds = [] } = req.body;

        // Check authentication status
        let userId = null;
        const accessToken = req.headers['x-access-token']?.replace('Bearer ', '');

        if (accessToken && accessToken !== 'undefined') {
            try {
                // Check if token is blacklisted
                const hashAccessToken = secureHash(accessToken);
                const isBlacklisted = await blacklistTokenModel.findOne({ token: hashAccessToken });

                if (!isBlacklisted) {
                    const secret_key = process.env.JWT_ACCESS_KEY || 'default-key';
                    const decoded = jwt.verify(accessToken, secret_key);
                    userId = decoded._id;
                }
            } catch (error) {
                // If token verification fails, treat as guest
                userId = null;
            }
        }

        const pipeline = [];

        if (Array.isArray(seenIds) && seenIds.length > 0) {
            pipeline.push({
                $match: {
                    _id: {
                        $nin: seenIds
                            .filter(id => mongoose.Types.ObjectId.isValid(id))
                            .map(id => new mongoose.Types.ObjectId(id))
                    }
                }
            });
        }

        pipeline.push({ $sample: { size: 10 } });

        const images = await imageModel.aggregate(pipeline);

        let processedImages = [];

        if (userId) {
            // Find likes for these images by the user
            const imageIds = images.map(img => img._id);
            const userLikes = await likeModel.find({
                user: userId,
                image: { $in: imageIds }
            });

            const likedImageIds = new Set(userLikes.map(like => like.image.toString()));

            processedImages = images.map(img => ({
                ...img,
                isLiked: likedImageIds.has(img._id.toString())
            }));
        } else {
            // Guest user - no likes
            processedImages = images.map(img => ({
                ...img,
                isLiked: false
            }));
        }

        return res.status(200).json({
            success: true,
            message: 'Random images retrieved successfully',
            payload: processedImages
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserById,
    updatePassword,
    getSocialMediaLinks,
    getRandomImages
};
