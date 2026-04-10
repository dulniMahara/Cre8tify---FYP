// Generic error handler to catch errors from express-async-handler
const errorHandler = (err, req, res, next) => {
  // If the status code is 200 (default), change it to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // 2. Clear temp file if an upload error occurs
    // This prevents filling up your LKR 4,000 budget storage with junk files [cite: 91]
    if (req.file) {
        const fs = require('fs');
        try {
            fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
            console.error('Failed to clean up file after error:', unlinkErr);
        }
    }
  
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