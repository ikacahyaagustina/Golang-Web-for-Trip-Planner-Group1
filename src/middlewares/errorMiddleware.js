const AppError = require('../utils/appError');

function notFound(req, res, next) {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const payload = {
    success: false,
    status: err.status || 'error',
    message: err.message || 'Internal server error',
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFound,
  errorHandler,
};
