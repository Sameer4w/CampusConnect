const express = require("express");
const asyncHandler =
  require("express-async-handler");

const User =
  require("../models/User");

const {
  generateToken,
  protect,
} =
  require("../middleware/authMiddleware");

const config =
  require("../config");

const router =
  express.Router();

// =====================================================
// HELPERS
// =====================================================

const sanitizeUser =
  (user) => ({
    _id:
      user._id,

    name:
      user.name,

    email:
      user.email,

    role:
      user.role,

    avatar:
      user.avatar,

    isActive:
      user.isActive,

    isEmailVerified:
      user.isEmailVerified,

    lastLogin:
      user.lastLogin,

    createdAt:
      user.createdAt,

    updatedAt:
      user.updatedAt,
  });

// =====================================================
// SET AUTH COOKIE
// =====================================================

const setAuthCookie =
  (
    res,
    token
  ) => {
    const isProduction =
      config.nodeEnv ===
      "production";

    res.cookie(
      "jwt",
      token,
      {
        httpOnly:
          true,

        secure:
          isProduction,

        sameSite:
          isProduction
            ? "none"
            : "lax",

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      }
    );
  };

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

router.post(
  "/register",

  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        name,
        email,
        password,
        role,
      } =
        req.body;

      // -----------------------------------------------
      // REQUIRED FIELDS
      // -----------------------------------------------

      if (
        !name ||
        !email ||
        !password
      ) {
        res.status(400);

        throw new Error(
          "Please provide name, email, and password"
        );
      }

      // -----------------------------------------------
      // NAME VALIDATION
      // -----------------------------------------------

      const cleanName =
        String(
          name
        ).trim();

      if (
        cleanName.length <
        2
      ) {
        res.status(400);

        throw new Error(
          "Name must be at least 2 characters"
        );
      }

      if (
        cleanName.length >
        100
      ) {
        res.status(400);

        throw new Error(
          "Name cannot exceed 100 characters"
        );
      }

      // -----------------------------------------------
      // EMAIL NORMALIZATION
      // -----------------------------------------------

      const cleanEmail =
        String(
          email
        )
          .trim()
          .toLowerCase();

      // -----------------------------------------------
      // PASSWORD VALIDATION
      // -----------------------------------------------

      if (
        typeof password !==
          "string" ||
        password.length <
          6
      ) {
        res.status(400);

        throw new Error(
          "Password must be at least 6 characters long"
        );
      }

      // -----------------------------------------------
      // ROLE VALIDATION
      //
      // Admin cannot be created
      // through public registration.
      // -----------------------------------------------

      const allowedPublicRoles = [
        "student",
        "recruiter",
      ];

      const selectedRole =
        role ||
        "student";

      if (
        !allowedPublicRoles.includes(
          selectedRole
        )
      ) {
        res.status(400);

        throw new Error(
          "You can register only as a student or recruiter"
        );
      }

      // -----------------------------------------------
      // CHECK EXISTING USER
      // -----------------------------------------------

      const existingUser =
        await User.findOne({
          email:
            cleanEmail,
        });

      if (
        existingUser
      ) {
        res.status(409);

        throw new Error(
          "An account with this email already exists"
        );
      }

      // -----------------------------------------------
      // CREATE USER
      // -----------------------------------------------

      const user =
        await User.create({
          name:
            cleanName,

          email:
            cleanEmail,

          password,

          role:
            selectedRole,
        });

      // -----------------------------------------------
      // GENERATE TOKEN
      // -----------------------------------------------

      const token =
        generateToken(
          user._id
        );

      setAuthCookie(
        res,
        token
      );

      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      res.status(201).json({
        success:
          true,

        message:
          "Registration successful",

        user:
          sanitizeUser(
            user
          ),

        token,
      });
    }
  )
);

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post(
  "/login",

  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        email,
        password,
      } =
        req.body;

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (
        !email ||
        !password
      ) {
        res.status(400);

        throw new Error(
          "Please provide email and password"
        );
      }

      const cleanEmail =
        String(
          email
        )
          .trim()
          .toLowerCase();

      // -----------------------------------------------
      // FIND USER
      // -----------------------------------------------

      const user =
        await User.findOne({
          email:
            cleanEmail,
        }).select(
          "+password"
        );

      if (
        !user
      ) {
        res.status(401);

        throw new Error(
          "Invalid email or password"
        );
      }

      // -----------------------------------------------
      // CHECK ACCOUNT STATUS
      // -----------------------------------------------

      if (
        !user.isActive
      ) {
        res.status(403);

        throw new Error(
          "Your account has been deactivated. Please contact an administrator."
        );
      }

      // -----------------------------------------------
      // CHECK PASSWORD
      // -----------------------------------------------

      const isPasswordCorrect =
        await user.matchPassword(
          password
        );

      if (
        !isPasswordCorrect
      ) {
        res.status(401);

        throw new Error(
          "Invalid email or password"
        );
      }

      // -----------------------------------------------
      // UPDATE LAST LOGIN
      // -----------------------------------------------

      user.lastLogin =
        new Date();

      await user.save();

      // -----------------------------------------------
      // GENERATE TOKEN
      // -----------------------------------------------

      const token =
        generateToken(
          user._id
        );

      setAuthCookie(
        res,
        token
      );

      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      res.status(200).json({
        success:
          true,

        message:
          "Login successful",

        user:
          sanitizeUser(
            user
          ),

        token,
      });
    }
  )
);

// =====================================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================================

router.get(
  "/me",

  protect,

  asyncHandler(
    async (
      req,
      res
    ) => {
      res.status(200).json({
        success:
          true,

        user:
          sanitizeUser(
            req.user
          ),
      });
    }
  )
);

// =====================================================
// LOGOUT
// POST /api/auth/logout
// =====================================================

router.post(
  "/logout",

  asyncHandler(
    async (
      req,
      res
    ) => {
      const isProduction =
        config.nodeEnv ===
        "production";

      res.cookie(
        "jwt",
        "",
        {
          httpOnly:
            true,

          secure:
            isProduction,

          sameSite:
            isProduction
              ? "none"
              : "lax",

          expires:
            new Date(0),
        }
      );

      res.status(200).json({
        success:
          true,

        message:
          "Logout successful",
      });
    }
  )
);

// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;