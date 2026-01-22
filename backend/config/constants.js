module.exports = {
    TOKEN_EXPIRY: {
        ACCESS_TOKEN: '3d',
        REFRESH_TOKEN: '10d',
        ACCESS_TOKEN_MS: 3 * 24 * 60 * 60 * 1000, // 3 days
        BLACKLIST_TOKEN_MODEL: 10 * 60 // 10 min
    },
    MESSAGES: {
        BAD_REQUEST: "Bad Request",
        USER_NOT_FOUND: "User Not Found",
        LOGIN_SUCCESS: "Login Success",
        REGISTER_SUCCESS: "Register Success",
        LOGOUT_SUCCESS: "Logout Success",
        USER_EXISTS: "User Already Exists",
        UNAUTH: "Unauthorized",
        AUTH: "Authorized",
        INVALID_EMAIL_PASSWORD: "Invalid Email or Password",
        INTERNAL_SERVER_ERROR: "Internal Server Error",
        TOKEN_REFRESH: "Tokens Refreshed Successfully",
        ACCESS_TOKEN_MISSING: "Access Token Missing",
        REFRESH_TOKEN_MISSING: "Refresh Token Missing",
        INVALID_REFRESH_TOKEN: "Invalid Refresh Token",
        SESSION_EXPIRE: "Session Expired, Please Login Again",
        TOKEN_REVOKE: "Token Has Been Revoked",
        INVALID_TOKEN: "Invalid Token",
        TOKEN_EXPIRE: "Token Expired Please Login Again",
    }
};
