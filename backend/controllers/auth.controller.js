const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, full_name, level } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    where: {
      [require('sequelize').Op.or]: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new ApiError(409, 'User with this email or username already exists');
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    full_name,
    level: level || 'beginner',
  });

  // Generate tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      token,
      refreshToken,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if account is active
  if (!user.is_active) {
    throw new ApiError(403, 'Account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Update streak and last login
  const today = new Date().toISOString().split('T')[0];
  const lastLogin = user.last_login_date;

  if (lastLogin) {
    const lastLoginDate = new Date(lastLogin);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      user.streak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      user.streak = 1;
    }
    // If diffDays === 0, same day login, no change
  } else {
    user.streak = 1;
  }

  user.last_login_date = today;
  await user.save();

  // Generate tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token,
      refreshToken,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(404, 'User not found with this email');
  }

  // Generate reset token
  const resetToken = user.generateResetToken();
  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Send email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    throw new ApiError(500, 'Email could not be sent');
  }
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    where: {
      reset_token: hashedToken,
      reset_token_expires: {
        [require('sequelize').Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Update password
  user.password = password;
  user.reset_token = null;
  user.reset_token_expires = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Here we can add token to blacklist if needed (using Redis)

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
};
