const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const Controller = require('../../controllers/like.controller');


router.use(authenticate);

// Get all user likes
router.get('/', Controller.getUserLikes);

// Toggle like status (add or remove)
router.post('/:imageId/toggle', Controller.toggleLike);

module.exports = router;
