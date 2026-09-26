// Admin (site owner) account used to log into /admin.
// Only used for authentication - there is intentionally no public
// "sign up" flow. Admin accounts are created with the seed script
// (see server/seed/createAdmin.js).

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
