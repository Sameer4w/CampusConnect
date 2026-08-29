const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/student',
  protect,
  requireRole('student', 'admin'),
  (req, res) => {
    res.json({
      message: 'Student-only endpoint accessed successfully',
      accessedBy: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      note: 'Accessible by: student, admin',
    });
  }
);

router.get(
  '/recruiter',
  protect,
  requireRole('recruiter', 'admin'),
  (req, res) => {
    res.json({
      message: 'Recruiter-only endpoint accessed successfully',
      accessedBy: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      note: 'Accessible by: recruiter, admin',
    });
  }
);

router.get(
  '/admin',
  protect,
  requireRole('admin'),
  (req, res) => {
    res.json({
      message: 'Admin-only endpoint accessed successfully',
      accessedBy: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      note: 'Accessible by: admin ONLY',
    });
  }
);

module.exports = router;
