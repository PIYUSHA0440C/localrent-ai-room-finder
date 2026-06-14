import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Token from '../models/Token.js';
import config from '../config/env.js';
import { sendVerificationEmail } from './emailService.js';

class AuthService {
  // Generate JWT access token
  generateAccessToken(userId) {
    return jwt.sign({ userId }, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });
  }

  // Generate JWT refresh token and store in DB
  async generateRefreshToken(userId) {
    const token = crypto.randomBytes(40).toString('hex');

    // Remove old refresh tokens for this user (max 5 sessions)
    const existingTokens = await Token.find({ user: userId }).sort({ createdAt: 1 });
    if (existingTokens.length >= 5) {
      await Token.findByIdAndDelete(existingTokens[0]._id);
    }

    await Token.create({
      user: userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return token;
  }

  // Register new user
  async register({ name, email, password, role }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    });

    // Send verification email (don't block on failure)
    sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error('Failed to send verification email:', err.message);
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = await this.generateRefreshToken(user._id);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  // Login user
  async login({ email, password }) {
    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.isSuspended) {
      const error = new Error('Your account has been suspended. Contact support.');
      error.statusCode = 403;
      throw error;
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = await this.generateRefreshToken(user._id);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }

    // Find the refresh token in DB
    const tokenDoc = await Token.findOne({ token: refreshToken });

    if (!tokenDoc) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    // Check if expired
    if (tokenDoc.expiresAt < new Date()) {
      await Token.findByIdAndDelete(tokenDoc._id);
      const error = new Error('Refresh token expired. Please login again.');
      error.statusCode = 401;
      throw error;
    }

    // Check user still exists and is not suspended
    const user = await User.findById(tokenDoc.user);
    if (!user) {
      await Token.findByIdAndDelete(tokenDoc._id);
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    if (user.isSuspended) {
      await Token.deleteMany({ user: user._id });
      const error = new Error('Account suspended');
      error.statusCode = 403;
      throw error;
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user._id);

    return { accessToken, user: user.toJSON() };
  }

  // Logout - remove refresh token
  async logout(refreshToken) {
    if (refreshToken) {
      await Token.findOneAndDelete({ token: refreshToken });
    }
  }

  // Verify email
  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!user) {
      const error = new Error('Invalid or expired verification link');
      error.statusCode = 400;
      throw error;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    return user.toJSON();
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens to force re-login on other devices
    await Token.deleteMany({ user: userId });
  }
}

export default new AuthService();
