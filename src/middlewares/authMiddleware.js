const { findUserById } = require('../models/userModel');
const AppError = require('../utils/appError');
const { verifyAccessToken } = require('../utils/jwt');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Unauthorized: token is required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.id);

    if (!user) {
      throw new AppError(401, 'Unauthorized: user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new AppError(401, 'Unauthorized: invalid token'));
  }
}

function authorizeRoles(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized: login required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden: insufficient role'));
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
