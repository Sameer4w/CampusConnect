const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const config = require("../config");
const User = require("../models/User");

// =====================================================
// GENERATE JWT TOKEN
// =====================================================

const generateToken = (userId) => {
  if (!config.jwt.secret) {
    throw new Error(
      "JWT_SECRET is not configured. Please set it in your .env file."
    );
  }

  return jwt.sign(
    {
      id: userId,
    },
    config.jwt.secret,
    {
      expiresIn:
        config.jwt.expiresIn,
    }
  );
};

// =====================================================
// EXTRACT TOKEN
// =====================================================

const getTokenFromRequest = (
  req
) => {
  // -----------------------------------------------
  // AUTHORIZATION HEADER
  // -----------------------------------------------

  const authorization =
    req.headers.authorization;

  if (
    authorization &&
    authorization.startsWith(
      "Bearer "
    )
  ) {
    return authorization
      .split(" ")[1];
  }

  // -----------------------------------------------
  // HTTP-ONLY COOKIE
  // -----------------------------------------------

  if (
    req.cookies &&
    req.cookies.jwt
  ) {
    return req.cookies.jwt;
  }

  return null;
};

// =====================================================
// PROTECT ROUTES
// =====================================================

const protect =
  asyncHandler(
    async (
      req,
      res,
      next
    ) => {
      // ---------------------------------------------
      // GET TOKEN
      // ---------------------------------------------

      const token =
        getTokenFromRequest(
          req
        );

      if (!token) {
        res.status(401);

        throw new Error(
          "Not authorized. Please log in to continue."
        );
      }

      // ---------------------------------------------
      // JWT CONFIGURATION
      // ---------------------------------------------

      if (
        !config.jwt.secret
      ) {
        res.status(500);

        throw new Error(
          "JWT_SECRET is not configured on the server"
        );
      }

      // ---------------------------------------------
      // VERIFY TOKEN
      // ---------------------------------------------

      let decoded;

      try {
        decoded =
          jwt.verify(
            token,
            config.jwt.secret
          );
      } catch (
        error
      ) {
        res.status(401);

        throw new Error(
          "Your session has expired or the token is invalid. Please log in again."
        );
      }

      // ---------------------------------------------
      // FIND USER
      // ---------------------------------------------

      const user =
        await User.findById(
          decoded.id
        );

      if (!user) {
        res.status(401);

        throw new Error(
          "User account no longer exists"
        );
      }

      // ---------------------------------------------
      // CHECK ACCOUNT STATUS
      // ---------------------------------------------

      if (
        !user.isActive
      ) {
        res.status(403);

        throw new Error(
          "Your account has been deactivated. Please contact an administrator."
        );
      }

      // ---------------------------------------------
      // ATTACH USER TO REQUEST
      // ---------------------------------------------

      req.user =
        user;

      next();
    }
  );

// =====================================================
// ROLE AUTHORIZATION
// =====================================================

const requireRole =
  (...allowedRoles) => {
    return (
      req,
      res,
      next
    ) => {
      // ---------------------------------------------
      // USER CHECK
      // ---------------------------------------------

      if (
        !req.user
      ) {
        res.status(401);

        return next(
          new Error(
            "Not authorized. Please log in to continue."
          )
        );
      }

      // ---------------------------------------------
      // ROLE CHECK
      // ---------------------------------------------

      if (
        !allowedRoles.includes(
          req.user.role
        )
      ) {
        res.status(403);

        return next(
          new Error(
            "You do not have permission to access this resource"
          )
        );
      }

      next();
    };
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  generateToken,
  protect,
  requireRole,
};