const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register-reviewer', authController.registerReviewer);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resetToken', authController.resetPassword);
router.post('/register-admin', authController.registerAdmin);

module.exports = router;
