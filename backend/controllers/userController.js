const User = require('../models/User');
const Submission = require('../models/Submission');
const asyncHandler = require('express-async-handler');

// @desc    Get all users with their submission counts
// @route   GET /api/users/with-submissions
// @access  Private/Admin
const getUsersWithSubmissions = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'patient' };
    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Get paginated users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get submission counts for each user
    const usersWithSubmissions = await Promise.all(
      users.map(async (user) => {
        const count = await Submission.countDocuments({ userId: user._id });
        return {
          ...user,
          submissionCount: count,
        };
      })
    );

    res.json({
      users: usersWithSubmissions,
      page,
      pages,
      total
    });
  } catch (error) {
    console.error('Error getting users with submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get submissions by user ID
// @route   GET /api/users/:userId/submissions
// @access  Private/Admin
const getSubmissionsByUserId = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const total = await Submission.countDocuments({ userId });
    const pages = Math.ceil(total / limit);

    // Get user's submissions
    const submissions = await Submission.find({ userId })
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      submissions,
      page,
      pages,
      total
    });
  } catch (error) {
    console.error('Error getting user submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getUsersWithSubmissions,
  getSubmissionsByUserId,
};
