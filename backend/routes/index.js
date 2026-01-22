const router = require('express').Router();
const apiRoutes = require('./api');

const api = '/api';

router.use(api, apiRoutes);

module.exports = router;
