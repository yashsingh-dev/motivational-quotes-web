const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    s3Key: {
        type: String,
        required: true,
        unique: true
    },
    s3Url: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('image', imageSchema);
