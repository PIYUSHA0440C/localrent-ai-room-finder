import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';

// Verify JWT access token and attach user to request
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found. Token is invalid.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please refresh your token.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Optional auth - attach user if token exists, but don't block
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.userId);
    if (user && !user.isSuspended) {
      req.user = user;
    }
  } catch {
    // Silently continue without user
  }

  next();
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};
