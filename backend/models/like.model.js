const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'image',
        required: true
    }
}, { timestamps: true });

likeSchema.index({ user: 1, image: 1 }, { unique: true });

module.exports = mongoose.model('like', likeSchema);
