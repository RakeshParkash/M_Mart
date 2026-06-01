const cloudinary = require('cloudinary').v2;

// The user provided the api_key and api_secret, but we also need the cloud_name
// We will read them from env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
