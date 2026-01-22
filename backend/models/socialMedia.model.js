const mongoose = require('mongoose');

const socialMediaSchema = mongoose.Schema({
    platform: {
        type: String,
        enum: ['youtube', 'instagram', 'facebook', 'threads'],
        required: true,
        unique: true
    },
    url: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('socialMedia', socialMediaSchema);
