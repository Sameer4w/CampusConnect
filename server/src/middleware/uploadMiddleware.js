const multer = require("multer");

// =====================================================
// UPLOAD CONSTANTS
// =====================================================

const MAX_RESUME_SIZE =
  5 * 1024 * 1024; // 5 MB

const MAX_AVATAR_SIZE =
  5 * 1024 * 1024; // 5 MB

// =====================================================
// MEMORY STORAGE
// =====================================================
//
// Files are temporarily stored in server memory.
//
// They are NOT saved permanently on the server.
//
// Flow:
//
// File
//   ↓
// Multer memory
//   ↓
// req.file.buffer
//   ↓
// Cloudinary
//   ↓
// Cloudinary URL saved in MongoDB
//

const storage =
  multer.memoryStorage();

// =====================================================
// RESUME PDF VALIDATION
// =====================================================

const resumeFileFilter =
  (
    req,
    file,
    callback
  ) => {
    const isPdfMimeType =
      file.mimetype ===
      "application/pdf";

    const isPdfExtension =
      file.originalname
        .toLowerCase()
        .endsWith(
          ".pdf"
        );

    if (
      !isPdfMimeType ||
      !isPdfExtension
    ) {
      const error =
        new Error(
          "Only PDF files are allowed. Please upload a .pdf resume."
        );

      return callback(
        error
      );
    }

    callback(
      null,
      true
    );
  };

// =====================================================
// AVATAR IMAGE VALIDATION
// =====================================================

const avatarFileFilter =
  (
    req,
    file,
    callback
  ) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const isAllowed =
      allowedMimeTypes.includes(
        file.mimetype
      );

    if (
      !isAllowed
    ) {
      const error =
        new Error(
          "Only JPG, PNG, and WEBP image files are allowed for avatars."
        );

      return callback(
        error
      );
    }

    callback(
      null,
      true
    );
  };

// =====================================================
// RESUME UPLOAD
// =====================================================

const uploadResume =
  multer({
    storage,

    limits: {
      fileSize:
        MAX_RESUME_SIZE,
    },

    fileFilter:
      resumeFileFilter,
  });

// =====================================================
// AVATAR UPLOAD
// =====================================================

const uploadAvatar =
  multer({
    storage,

    limits: {
      fileSize:
        MAX_AVATAR_SIZE,
    },

    fileFilter:
      avatarFileFilter,
  });

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  uploadResume,
  uploadAvatar,
};