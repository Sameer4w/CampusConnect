const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/authMiddleware');
const config = require('../config');

const router = express.Router();

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const setAuthCookie = (res, token) => {
  const isProduction = config.nodeEnv === 'production';
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    if (name.trim().length < 2) {
      res.status(400);
      throw new Error('Name must be at least 2 characters');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    if (role && !User.ROLES.includes(role)) {
      res.status(400);
      throw new Error(`Role must be one of: ${User.ROLES.join(', ')}`);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role || 'student',
    });

    if (!user) {
      res.status(500);
      throw new Error('Failed to create user account');
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registration successful',
      user: sanitizeUser(user),
      token,
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    });
  })
);

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      user: sanitizeUser(req.user),
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({
      message: 'Logout successful',
    });
  })
);

module.exports = router;
