const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

router.post('/verify-email',authController.verifyEmail);
router.get('/verify-token',authController.verifyToken);
router.post('/register', authController.register);
router.post('/authenticate',authController.authenticate);

module.exports = app => app.use('/auth', router);
