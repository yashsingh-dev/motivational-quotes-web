const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    whatsapp: {
        type: String,
    },
    watermark: {
        type: String,
    },
    password: {
        type: String,
        select: false,
        minLength: [6, "Password must be atleast 3 character long"]
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'blocked'],
        default: 'pending'
    },
    activatedAt: {
        type: Date,
        default: null
    },
    remarks: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true });

module.exports = mongoose.model('user', userModel);