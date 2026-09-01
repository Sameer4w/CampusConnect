const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// =====================================================
// USER ROLES
// =====================================================

const ROLES = [
  "student",
  "recruiter",
  "admin",
];

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    // ===============================================
    // BASIC INFORMATION
    // ===============================================

    name: {
      type: String,
      required: [
        true,
        "Name is required",
      ],
      trim: true,
      minlength: [
        2,
        "Name must be at least 2 characters",
      ],
      maxlength: [
        100,
        "Name cannot exceed 100 characters",
      ],
    },

    email: {
      type: String,
      required: [
        true,
        "Email is required",
      ],
      unique: true,
      uniqueCaseInsensitive: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },

    // ===============================================
    // PASSWORD
    // ===============================================

    password: {
      type: String,
      required: [
        true,
        "Password is required",
      ],
      minlength: [
        6,
        "Password must be at least 6 characters long",
      ],
      select: false,
    },

    // ===============================================
    // ROLE
    // ===============================================

    role: {
      type: String,
      enum: {
        values: ROLES,
        message:
          "Role must be one of: student, recruiter, admin",
      },
      default: "student",
    },

    // ===============================================
    // PROFILE AVATAR
    // ===============================================

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    // ===============================================
    // ACCOUNT STATUS
    // ===============================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ===============================================
    // EMAIL VERIFICATION
    // ===============================================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ===============================================
    // LAST LOGIN
    // ===============================================

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// =====================================================
// VIRTUAL ID
// =====================================================

userSchema.virtual("id").get(
  function () {
    return this._id.toHexString();
  }
);

// =====================================================
// PASSWORD HASHING
// =====================================================

userSchema.pre(
  "save",
  async function (next) {
    // Only hash password if changed
    if (!this.isModified("password")) {
      return next();
    }

    try {
      const salt =
        await bcrypt.genSalt(10);

      this.password =
        await bcrypt.hash(
          this.password,
          salt
        );

      next();
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// PASSWORD COMPARISON
// =====================================================

userSchema.methods.matchPassword =
  async function (
    enteredPassword
  ) {
    return bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

// =====================================================
// SAFE JSON RESPONSE
// =====================================================

userSchema.methods.toJSON =
  function () {
    const user =
      this.toObject({
        virtuals: true,
      });

    // Never send password
    delete user.password;

    // Remove internal mongoose version
    delete user.__v;

    return user;
  };

// =====================================================
// USER ROLE HELPER
// =====================================================

userSchema.methods.hasRole =
  function (role) {
    return this.role === role;
  };

// =====================================================
// EXPORT ROLES
// =====================================================

userSchema.statics.ROLES =
  ROLES;

// =====================================================
// MODEL
// =====================================================

const User =
  mongoose.model(
    "User",
    userSchema
  );

module.exports = User;