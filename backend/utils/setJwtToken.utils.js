const jwt = require('jsonwebtoken');
const { TOKEN_EXPIRY } = require('../config/constants');
const refreshTokenModel = require('../models/refreshToken.model');
const { secureHash } = require('./crypto.utils');

module.exports.generateAccessToken = async function (userId) {
    const secret_key = process.env.JWT_ACCESS_KEY || 'default-key';
    try {
        let access_token = jwt.sign({ _id: userId }, secret_key, {
            expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN
        });

        return access_token;
    } catch (error) {
        throw error;
    }
}

module.exports.generateRefreshToken = async function (userId) {
    const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
    try {
        let refresh_token = jwt.sign({ _id: userId }, secret_key, {
            expiresIn: TOKEN_EXPIRY.REFRESH_TOKEN
        });

        // Generate Hash of refresh token
        const hash_refresh_token = secureHash(refresh_token);

        // Store in DB
        await refreshTokenModel.create({ token: hash_refresh_token, userId });

        return refresh_token;
    } catch (error) {
        throw error;
    }
}