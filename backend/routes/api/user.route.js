const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const UserController = require('../../controllers/user.controller');

// Public routes
router.get('/social-media', UserController.getSocialMediaLinks);
router.post('/random-images', UserController.getRandomImages);

// User routes
router.use(authenticate);
router.get('/:id', UserController.getUserById);
router.put('/password', UserController.updatePassword);

module.exports = router;
