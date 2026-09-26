// One-off script to create the first (or another) admin account.
//
// Usage (from inside the /server folder):
//   node seed/createAdmin.js youremail@example.com yourpassword
// or:
//   npm run create-admin -- youremail@example.com yourpassword

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const Admin = require('../models/Admin');

async function run() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.log('Usage: node seed/createAdmin.js <email> <password>');
    process.exit(1);
  }

  if (password.length < 6) {
    console.log('Password should be at least 6 characters.');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);

  const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.log(`An admin with email "${email}" already exists.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email: email.toLowerCase().trim(), passwordHash });

  console.log(`Admin account created for ${email}. You can now log in at /admin/login.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
