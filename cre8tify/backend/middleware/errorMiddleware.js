// Generic error handler to catch errors from express-async-handler
const errorHandler = (err, req, res, next) => {
  // If the status code is 200 (default), change it to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Shows stack trace only in development, not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};