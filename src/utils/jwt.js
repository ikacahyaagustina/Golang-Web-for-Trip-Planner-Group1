const jwt = require('jsonwebtoken');

function generateAccessToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(payload, secret, { expiresIn });
}

function verifyAccessToken(token) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return jwt.verify(token, secret);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
