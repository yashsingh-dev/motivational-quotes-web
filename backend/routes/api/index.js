const router = require('express').Router();
const authRoutes = require('./auth.route');
const adminRoutes = require('./admin.route');
const userRoutes = require('./user.route');
const likeRoutes = require('./like.route');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/likes', likeRoutes);

module.exports = router;
