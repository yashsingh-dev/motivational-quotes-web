const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");
const { MESSAGES } = require("../config/constants");
const blacklistTokenModel = require('../models/blacklistToken.model');
const { secureHash } = require('../utils/crypto.utils');
const ApiError = require('../utils/ApiError');

module.exports.authenticate = async (req, res, next) => {
    try {

        // Check Access Token
        const accessToken = req.headers['x-access-token']?.replace('Bearer ', '');
        if (!accessToken || accessToken === 'undefined') {
            throw new ApiError(401, MESSAGES.ACCESS_TOKEN_MISSING);
        }

        // Check for access token hash in Blacklisted DB
        const hashAccessToken = secureHash(accessToken);
        let isBlacklisted = await blacklistTokenModel.findOne({ token: hashAccessToken });
        if (isBlacklisted) {
            throw new ApiError(403, MESSAGES.TOKEN_REVOKE);
        }

        // Verify JWT Signature and expiry
        const secret_key = process.env.JWT_ACCESS_KEY || 'default-key';
        let decoded = jwt.verify(accessToken, secret_key);

        let user_data = await userModel.findById(decoded._id).select('+password');
        if (!user_data) {
            res.removeHeader('x-access-token');
            res.removeHeader('x-refresh-token');
            throw new ApiError(409, MESSAGES.USER_NOT_FOUND);
        }

        req.user = {
            ...user_data.toObject()
        };
        next();
    }
    catch (error) {
        next(error);
    }
}