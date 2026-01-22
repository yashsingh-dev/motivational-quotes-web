const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const Controller = require('../../controllers/auth.controller');


router.post('/login',
    Controller.login
);

router.post('/register',
    Controller.register
);

router.get('/logout',
    authenticate,
    Controller.logout
);

router.get('/status',
    authenticate,
    Controller.checkAuth
);

router.get('/token-refresh',
    Controller.refreshAccessToken
);


module.exports = router;