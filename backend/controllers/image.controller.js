const multer = require('multer');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/s3.config');
const imageModel = require('../models/image.model');
const ApiError = require('../utils/ApiError');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

/**
 * Upload single image to S3
 * POST /api/admin/images/upload
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No file uploaded');
        }

        const file = req.file;
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;
        const s3Key = `images/${fileName}`;

        // Upload to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentType: file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct S3 URL
        const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;

        // Save metadata to database
        const imageRecord = await imageModel.create({
            originalName: file.originalname,
            s3Key: s3Key,
            s3Url: s3Url,
            size: file.size,
            mimetype: file.mimetype,
            uploadedBy: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            payload: imageRecord
        });
    }
    catch (error) {
        next(error);
    }
};

/**
 * Get all images with pagination
 * GET /api/admin/images
 */
const getAllImages = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const images = await imageModel
            .find()
            .populate('uploadedBy', 'name email')
            .limit(Number(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await imageModel.countDocuments();

        return res.status(200).json({
            success: true,
            message: 'Images retrieved successfully',
            payload: {
                images,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};

/**
 * Get image by ID
 * GET /api/admin/images/:id
 */
const getImageById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const image = await imageModel
            .findById(id)
            .populate('uploadedBy', 'name email');

        if (!image) {
            throw new ApiError(404, 'Image not found');
        }

        return res.status(200).json({
            success: true,
            message: 'Image retrieved successfully',
            payload: image
        });
    }
    catch (error) {
        next(error);
    }
};

/**
 * Delete image
 * DELETE /api/admin/images/:id
 */
const deleteImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find image record
        const image = await imageModel.findById(id);
        if (!image) {
            throw new ApiError(404, 'Image not found');
        }

        // Delete from S3
        const deleteParams = {
            Bucket: bucketName,
            Key: image.s3Key
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        // Delete from database
        await imageModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};

module.exports = {
    upload,
    uploadImage,
    getAllImages,
    getImageById,
    deleteImage
};
