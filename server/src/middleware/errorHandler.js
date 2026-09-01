const multer = require("multer");

// =====================================================
// NOT FOUND HANDLER
// =====================================================

const notFound = (
  req,
  res,
  next
) => {
  res.status(404);

  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  next(error);
};

// =====================================================
// ERROR HANDLER
// =====================================================

const errorHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(error);

  // ===================================================
  // MULTER UPLOAD ERRORS
  // ===================================================

  if (
    error instanceof multer.MulterError
  ) {
    // -----------------------------------------------
    // FILE TOO LARGE
    // -----------------------------------------------

    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Resume must be 5 MB or smaller. Please upload a smaller PDF file.",
      });
    }

    // -----------------------------------------------
    // UNEXPECTED FILE
    // -----------------------------------------------

    if (
      error.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid resume upload field.",
      });
    }

    // -----------------------------------------------
    // OTHER MULTER ERRORS
    // -----------------------------------------------

    return res.status(400).json({
      success: false,

      message:
        "File upload failed. Please try again.",
    });
  }

  // ===================================================
  // PDF VALIDATION ERROR
  // ===================================================

  if (
    error.message ===
    "Only PDF files are allowed for resumes"
  ) {
    return res.status(400).json({
      success: false,

      message:
        "Only PDF files are allowed for resumes.",
    });
  }

  // ===================================================
  // MONGOOSE VALIDATION ERROR
  // ===================================================

  if (
    error.name ===
    "ValidationError"
  ) {
    const messages =
      Object.values(
        error.errors
      ).map(
        (item) =>
          item.message
      );

    return res.status(400).json({
      success: false,

      message:
        messages.join(", "),

      errors:
        messages,
    });
  }

  // ===================================================
  // MONGOOSE CAST ERROR
  // ===================================================

  if (
    error.name ===
    "CastError"
  ) {
    return res.status(400).json({
      success: false,

      message:
        "Invalid resource ID.",
    });
  }

  // ===================================================
  // MONGOOSE DUPLICATE KEY ERROR
  // ===================================================

  if (
    error.code ===
    11000
  ) {
    return res.status(400).json({
      success: false,

      message:
        "A record with this information already exists.",
    });
  }

  // ===================================================
  // GENERAL ERROR
  // ===================================================

  const statusCode =
  error.statusCode ||
  (
    res.statusCode !== 200
      ? res.statusCode
      : 500
  );
  

  res
    .status(statusCode)
    .json({
      success: false,

      message:
        error.message ||
        "Something went wrong. Please try again.",

      ...(process.env.NODE_ENV ===
        "development" && {
        stack:
          error.stack,
      }),
    });
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  notFound,
  errorHandler,
};