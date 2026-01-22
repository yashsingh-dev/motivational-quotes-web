const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/admin.middleware');
const AdminController = require('../../controllers/admin.controller');
const ImageController = require('../../controllers/image.controller');


// Admin routes
router.use(authenticate, isAdmin);

// Dashboard statistics
router.get('/dashboard/stats', AdminController.getDashboardStats);

// User management routes 
router.get('/users', AdminController.getAllUsers);
router.put('/users/:id', AdminController.updateUser); 
router.delete('/users/:id', AdminController.deleteUser);
router.patch('/users/:id/status', AdminController.updateUserStatus);

// Image management routes
router.post('/images/upload', ImageController.upload.single('image'), ImageController.uploadImage);
router.get('/images', ImageController.getAllImages);
router.get('/images/:id', ImageController.getImageById);
router.delete('/images/:id', ImageController.deleteImage);

// Social media management routes
router.put('/social-media', AdminController.updateAllSocialMediaLinks);
router.patch('/social-media/:platform/toggle', AdminController.toggleSocialMediaStatus);

module.exports = router;
