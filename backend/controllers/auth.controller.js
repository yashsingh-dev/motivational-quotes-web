const { secureHash } = require('../utils/crypto.utils');
const { generateAccessToken, generateRefreshToken } = require('../utils/setJwtToken.utils');
const { MESSAGES } = require('../config/constants');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const refreshTokenModel = require('../models/refreshToken.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const ApiError = require('../utils/ApiError');


const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }

        // Find User
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            throw new ApiError(401, MESSAGES.INVALID_EMAIL_PASSWORD);
        }

        // Check Password
        const isMatch = (password === user.password);
        if (!isMatch) {
            throw new ApiError(401, MESSAGES.INVALID_EMAIL_PASSWORD);
        }

        if (role) {
            if (user.role !== role) throw new ApiError(401, 'Invalid Role');
        }

        // Generate JWT Tokens
        const accessToken = await generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        // Set tokens in response headers
        res.setHeader('x-access-token', 'Bearer ' + accessToken);
        res.setHeader('x-refresh-token', 'Bearer ' + refreshToken);

        console.log(`User logged in: ${user.email}`);

        // Send Response
        return res.status(200).json({
            success: true,
            message: MESSAGES.LOGIN_SUCCESS,
            payload: {
                ...user.toObject()
            }
        });
    }
    catch (error) {
        next(error);
    }
}

const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            whatsapp,
            watermark,
            password,
            role
        } = req.body;

        if (!email || !password || !name || !whatsapp || !watermark) {
            throw new ApiError(400, 'All fields are required');
        }

        // Check User
        const user = await userModel.findOne({ email }).select('+password');
        if (user) {
            throw new ApiError(409, MESSAGES.USER_EXISTS);
        }

        // Prepare user data
        const userData = {
            name,
            email,
            whatsapp,
            watermark,
            password,
            role
        };

        // Add User
        const new_user = await userModel.create(userData);

        // Generate JWT Token
        const accessToken = await generateAccessToken(new_user._id);
        const refreshToken = await generateRefreshToken(new_user._id);

        // Set tokens in response headers
        res.setHeader('x-access-token', 'Bearer ' + accessToken);
        res.setHeader('x-refresh-token', 'Bearer ' + refreshToken);

        console.log(`User Created : ${new_user.email}`);

        // Send Response
        return res.status(201).json({
            success: true,
            message: MESSAGES.REGISTER_SUCCESS,
            payload: {
                ...new_user.toObject()
            }
        });
    }
    catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        const accessToken = req.headers['x-access-token']?.replace('Bearer ', '');
        const refreshToken = req.headers['x-refresh-token']?.replace('Bearer ', '');

        // Check Refresh Token
        if (!refreshToken || refreshToken === 'undefined') {
            // Logout is done at the end
            res.removeHeader('x-access-token');
            res.removeHeader('x-refresh-token');
            return res.status(200).json({ success: true, message: MESSAGES.LOGOUT_SUCCESS });
        }

        // Check if refreshToken is valid.
        const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
        const decoded = jwt.verify(refreshToken, secret_key);

        // Check if the user from the token exists
        const user = await userModel.findById(decoded._id);
        if (!user) {
            throw new ApiError(409, MESSAGES.USER_NOT_FOUND);
        }

        // Create accessToken hash and it in blacklist collection
        if (accessToken) {
            const hashAccessToken = secureHash(accessToken);
            await blacklistTokenModel.create({ token: hashAccessToken });
        }

        // Create refreshToken hash delete from refreshToken collection
        const hashRefreshToken = secureHash(refreshToken);
        await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });

        // Clear Header
        res.removeHeader('x-access-token');
        res.removeHeader('x-refresh-token');

        return res.status(200).json({
            success: true,
            message: MESSAGES.LOGOUT_SUCCESS
        });
    }
    catch (error) {
        // Always clear header on any logout error to prevent a bad state
        res.removeHeader('x-access-token');
        res.removeHeader('x-refresh-token');
        next(error);
    }
}

const checkAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new ApiError(401, MESSAGES.UNAUTH);
        }

        // Send Response
        return res.status(200).json({
            success: true,
            message: MESSAGES.AUTH,
            payload: {
                ...req.user,
            }
        });
    }
    catch (error) {
        next(error);
    }
}

const refreshAccessToken = async (req, res, next) => {
    const oldRefreshToken = req.headers['x-refresh-token']?.replace('Bearer ', '');
    try {
        // Check if refresh token exists in header
        if (!oldRefreshToken || oldRefreshToken === 'undefined') {
            res.removeHeader('x-access-token');
            res.removeHeader('x-refresh-token');
            throw new ApiError(401, MESSAGES.REFRESH_TOKEN_MISSING);
        }

        // Create refreshToken hash and check if it exists in DB
        const hashRefreshToken = secureHash(oldRefreshToken);
        const tokenDoc = await refreshTokenModel.findOne({ token: hashRefreshToken });
        if (!tokenDoc) {
            throw new ApiError(403, MESSAGES.INVALID_REFRESH_TOKEN);
        }

        // Verify refresh token and expiry using its secret key
        const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
        const decoded = jwt.verify(oldRefreshToken, secret_key);

        // Delete old refresh token hash from DB
        await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });

        // Get user from collection using decoded token id
        const user = await userModel.findById(decoded._id);

        if (!user) {
            throw new ApiError(409, MESSAGES.USER_NOT_FOUND);
        }

        // Generate new access and refresh token
        const newAccessToken = await generateAccessToken(decoded._id);
        const newRefreshToken = await generateRefreshToken(decoded._id);

        // Set Headers
        res.setHeader('x-access-token', 'Bearer ' + newAccessToken);
        res.setHeader('x-refresh-token', 'Bearer ' + newRefreshToken);

        return res.status(200).json({
            success: true,
            message: MESSAGES.TOKEN_REFRESH
        });
    }
    catch (error) {
        // Clear Header
        res.removeHeader('x-access-token');
        res.removeHeader('x-refresh-token');

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: MESSAGES.SESSION_EXPIRE });
        }
        next(error);
    }
}


module.exports = { login, register, logout, checkAuth, refreshAccessToken };