const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

// Protected profile route
router.get('/profile', protect, getProfile);
// Admin-only test route
router.get('/admin', protect, adminOnly, (req, res) => {
  res.json({
    message: 'Welcome, Admin!',
    user: {
      id: req.user._id,
      email: req.user.email,
    },
  });
});

module.exports = router;
