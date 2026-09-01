const cloudinary = require("cloudinary").v2;

// =====================================================
// CLOUDINARY ENVIRONMENT CHECK
// =====================================================

console.log("Cloudinary environment check:", {
  cloudName: Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
  ),

  apiKey: Boolean(
    process.env.CLOUDINARY_API_KEY
  ),

  apiSecret: Boolean(
    process.env.CLOUDINARY_API_SECRET
  ),
});

// =====================================================
// CLOUDINARY CONFIGURATION
// =====================================================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// =====================================================
// EXPORT
// =====================================================

module.exports = cloudinary;