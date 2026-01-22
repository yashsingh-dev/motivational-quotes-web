const userModel = require('../models/user.model');
const imageModel = require('../models/image.model');
const socialMediaModel = require('../models/socialMedia.model');
const ApiError = require('../utils/ApiError');
const { MESSAGES } = require('../config/constants');

/**
 * Get all users
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, role, search } = req.query;

        // Build filter query
        const filter = {
            _id: { $ne: req.user._id } // Exclude current user
        };

        if (status) filter.status = status;
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { whatsapp: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await userModel
            .find(filter)
            .select('+password') // Explicitly select password
            .limit(Number(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await userModel.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            payload: {
                users,
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

/**
 * Update user
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            whatsapp,
            watermark,
            password,
            activatedAt,
            remarks
        } = req.body;

        // Check if user exists
        const user = await userModel.findById(id);
        if (!user) {
            throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
        }

        // Prepare update data
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
        if (watermark !== undefined) updateData.watermark = watermark;
        if (password !== undefined) updateData.password = password;
        if (activatedAt !== undefined) updateData.activatedAt = activatedAt;
        if (remarks !== undefined) updateData.remarks = remarks;

        // Update user
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('+password');

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            payload: updatedUser
        });
    }
    catch (error) {
        next(error);
    }
};

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await userModel.findById(id);
        if (!user) {
            throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            throw new ApiError(400, 'You cannot delete your own account');
        }

        // Delete user
        await userModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};

/**
 * Update user status
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'pending', 'blocked'].includes(status)) {
            throw new ApiError(400, 'Invalid status. Must be active, pending, or blocked');
        }

        // Check if user exists
        const user = await userModel.findById(id);
        if (!user) {
            throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
        }

        // Prevent admin from blocking themselves
        if (user._id.toString() === req.user._id.toString() && (status === 'blocked' || status === 'pending')) {
            throw new ApiError(400, 'You cannot block or pending your own account');
        }

        const updateData = { status };
        // If status is being changed to 'active' and activatedAt is not set, set it now
        if (status === 'active' && !user.activatedAt) {
            updateData.activatedAt = new Date();
        }

        // Update user status
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        return res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            payload: updatedUser
        });
    }
    catch (error) {
        next(error);
    }
};

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const activeUsers = await userModel.countDocuments({ status: 'active' });
        const totalImages = await imageModel.countDocuments();

        return res.status(200).json({
            success: true,
            message: 'Dashboard stats retrieved successfully',
            payload: {
                totalUsers,
                activeUsers,
                totalImages
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update all social media links at once
 * PUT /api/admin/social-media
 */
const updateAllSocialMediaLinks = async (req, res, next) => {
    try {
        const { links } = req.body;

        if (!links || typeof links !== 'object') {
            throw new ApiError(400, 'Invalid request body. Expected { links: { platform: { url, isActive } } }');
        }

        const validPlatforms = ['youtube', 'instagram', 'facebook', 'threads'];
        const updatePromises = [];

        // Validate and prepare updates
        for (const [platform, data] of Object.entries(links)) {
            if (!validPlatforms.includes(platform)) {
                throw new ApiError(400, `Invalid platform: ${platform}`);
            }

            // Handle both old format (string) and new format (object with url and isActive)
            const updateData = typeof data === 'string'
                ? { url: data }
                : {
                    url: data.url || '',
                    isActive: data.isActive !== undefined ? data.isActive : true
                };

            updatePromises.push(
                socialMediaModel.findOneAndUpdate(
                    { platform },
                    updateData,
                    { new: true, upsert: true, runValidators: true }
                )
            );
        }

        // Execute all updates
        const updatedLinks = await Promise.all(updatePromises);

        return res.status(200).json({
            success: true,
            message: 'All social media links updated successfully',
            payload: updatedLinks
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle social media platform active status
 * PATCH /api/admin/social-media/:platform/toggle
 */
const toggleSocialMediaStatus = async (req, res, next) => {
    try {
        const { platform } = req.params;

        const validPlatforms = ['youtube', 'instagram', 'facebook', 'threads'];
        if (!validPlatforms.includes(platform)) {
            throw new ApiError(400, 'Invalid platform');
        }

        // Find the current link
        const link = await socialMediaModel.findOne({ platform });

        if (!link) {
            throw new ApiError(404, `Social media link for ${platform} not found`);
        }

        // Toggle the isActive status
        link.isActive = !link.isActive;
        await link.save();

        return res.status(200).json({
            success: true,
            message: `${platform} status ${link.isActive ? 'activated' : 'deactivated'} successfully`,
            payload: link
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateAllSocialMediaLinks,
    toggleSocialMediaStatus
};
