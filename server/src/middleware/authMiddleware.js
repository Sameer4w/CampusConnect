const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const config = require('../config');
const User = require('../models/User');

const generateToken = (userId) => {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET is not configured. Please set it in your .env file.');
  }

  return jwt.sign(
    { id: userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - no token provided');
  }

  try {
    if (!config.jwt.secret) {
      res.status(500);
      throw new Error('JWT_SECRET is not configured on the server');
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('Not authorized - user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized - invalid or expired token');
  }
});

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized - user not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Access denied - requires role: ${allowedRoles.join(', ')}. ` +
          `Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = {
  generateToken,
  protect,
  requireRole,
};
