const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/pending-reviewers', verifyToken, verifyRole(['admin']), userController.getPendingReviewers);
router.get('/reviewers', verifyToken, verifyRole(['admin']), userController.getAllReviewers);
router.post('/reviewer-status', verifyToken, verifyRole(['admin']), userController.handleReviewerStatus);

module.exports = router;
