const mongoose = require('mongoose');
const { TOKEN_EXPIRY } = require('../config/constants');

const blacklistTokenModel = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: TOKEN_EXPIRY.BLACKLIST_TOKEN_MODEL
    }
});

module.exports = mongoose.model('blacklistToken', blacklistTokenModel); 