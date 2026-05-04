const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content
 * @returns {Promise} Send result
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EnglishMaster <noreply@englishmaster.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 */
const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Welcome to EnglishMaster!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining EnglishMaster. We're excited to help you on your English learning journey!</p>
      <p>Here's what you can do:</p>
      <ul>
        <li>Learn vocabulary with spaced repetition</li>
        <li>Practice with interactive lessons</li>
        <li>Chat with AI for conversation practice</li>
        <li>Watch video lessons with subtitles</li>
        <li>Track your progress and earn badges</li>
      </ul>
      <p>Get started now and achieve your English learning goals!</p>
      <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Start Learning</a>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        If you have any questions, feel free to contact us.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to EnglishMaster!',
    html,
  });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Reset token
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Password Reset Request</h1>
      <p>You requested a password reset for your EnglishMaster account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Reset Password</a>
      <p style="margin-top: 30px; color: #666;">
        This link will expire in 1 hour.
      </p>
      <p style="color: #666;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request - EnglishMaster',
    html,
  });
};

/**
 * Send streak reminder email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {number} streak - Current streak
 */
const sendStreakReminderEmail = async (email, name, streak) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Don't Break Your Streak! 🔥</h1>
      <p>Hi ${name},</p>
      <p>You're on a <strong>${streak}-day streak</strong>! Don't let it end today.</p>
      <p>Just a few minutes of practice will keep your streak alive and help you reach your goals.</p>
      <a href="${process.env.FRONTEND_URL}/lessons" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Continue Learning</a>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Keep up the great work!
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Don't Break Your ${streak}-Day Streak! 🔥`,
    html,
  });
};

/**
 * Send badge earned email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {object} badge - Badge object
 */
const sendBadgeEarnedEmail = async (email, name, badge) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Congratulations! 🎉</h1>
      <p>Hi ${name},</p>
      <p>You've earned a new badge:</p>
      <div style="text-align: center; padding: 30px; background-color: #F3F4F6; border-radius: 8px; margin: 20px 0;">
        <div style="font-size: 64px; margin-bottom: 10px;">${badge.icon}</div>
        <h2 style="color: #1F2937; margin: 10px 0;">${badge.name}</h2>
        <p style="color: #6B7280;">${badge.description}</p>
        <p style="color: #4F46E5; font-weight: bold; margin-top: 15px;">+${badge.xp_reward} XP</p>
      </div>
      <p>Keep up the excellent work!</p>
      <a href="${process.env.FRONTEND_URL}/profile" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Your Badges</a>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `You Earned a Badge: ${badge.name}! 🎉`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendStreakReminderEmail,
  sendBadgeEarnedEmail,
};
