const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { getUsersWithSubmissions, getSubmissionsByUserId } = require('../controllers/userController');

const router = express.Router();

// Get all users with their submission counts (admin only)
router.get('/with-submissions', protect, admin, getUsersWithSubmissions);

// Get submissions by user ID (admin only)
router.get('/:userId/submissions', protect, admin, getSubmissionsByUserId);

module.exports = router;
