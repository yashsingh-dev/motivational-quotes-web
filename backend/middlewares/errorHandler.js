const { MESSAGES } = require("../config/constants");

module.exports.errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = MESSAGES.TOKEN_EXPIRE
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = MESSAGES.INVALID_TOKEN
    }

    console.log(`[${statusCode}] Global Error: ${message}`, err.stack);

    return res.status(statusCode).json({
        success: false,
        message: message,
        payload: err
    });
}
