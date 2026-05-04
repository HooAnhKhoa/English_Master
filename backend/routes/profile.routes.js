const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// All routes require authentication
router.use(verifyToken);

// GET /api/user/profile - Get user profile with overview
router.get('/profile', profileController.getProfile);

// GET /api/user/check-username - Check username availability
router.get('/check-username', profileController.checkUsernameAvailable);

// PUT /api/user/profile - Update user profile
router.put('/profile', profileController.updateProfile);

// POST /api/user/avatar - Upload avatar
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

// PUT /api/user/change-password - Change password
router.put('/change-password', profileController.changePassword);

// GET /api/user/stats/detail - Get detailed statistics
router.get('/stats/detail', profileController.getDetailedStats);

// GET /api/user/activity-feed - Get activity feed
router.get('/activity-feed', profileController.getActivityFeed);

// DELETE /api/user/account - Delete account
router.delete('/account', profileController.deleteAccount);

module.exports = router;
