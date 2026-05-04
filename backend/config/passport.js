const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

/**
 * Configure Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({
          where: { google_id: profile.id },
        });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if email already exists
        const existingUser = await User.findOne({
          where: { email: profile.emails[0].value },
        });

        if (existingUser) {
          // Link Google account to existing user
          existingUser.google_id = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }

        // Create new user
        user = await User.create({
          google_id: profile.id,
          email: profile.emails[0].value,
          username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
          full_name: profile.displayName,
          avatar: profile.photos[0]?.value,
          password: 'google_oauth_' + Math.random().toString(36).substring(7),
          level: 'beginner',
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
