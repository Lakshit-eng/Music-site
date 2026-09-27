const express = require("express");
const cloudinary = require("../cloudinary");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/signature", auth, (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "spellze",
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    res.status(500).json({
      message: "Failed to generate Cloudinary upload signature",
    });
  }
});

module.exports = router;