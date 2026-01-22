const ApiError = require('../utils/ApiError');
const { MESSAGES } = require('../config/constants');

module.exports.isAdmin = async (req, res, next) => {
    try {
        // Check if user exists (should be set by authenticate middleware)
        if (!req.user) {
            throw new ApiError(401, MESSAGES.UNAUTH);
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            throw new ApiError(403, 'Access denied. Admin privileges required.');
        }

        next();
    }
    catch (error) {
        next(error);
    }
};
