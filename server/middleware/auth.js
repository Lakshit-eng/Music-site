// Protects admin-only routes.
// Expects a header:  Authorization: Bearer <token>

const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.admin = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

module.exports = requireAuth;
