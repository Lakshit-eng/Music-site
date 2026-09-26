const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: admin._id, email: admin.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.json({
    token,
    admin: { id: admin._id, email: admin.email },
  });
});

// GET /api/auth/me  (protected - used by the frontend to check if a
// stored token is still valid when the admin reloads the page)
const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = { login, me };
