const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Need the User model to find the user from the token

// Middleware to protect routes (checks for a valid JWT token)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for the authorization header, which should be in the format: "Bearer TOKEN"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Get token from header (removes 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the token payload (excluding password hash)
      // req.user will now be available in all protected controllers
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401); // 401: Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


// Middleware to check if the user has a specific role (buyer, designer, admin)
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // Check if the role of the user attached to the request (from the 'protect' middleware) 
    // is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
      res.status(403); // 403: Forbidden
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};


module.exports = {
  protect,
  authorizeRole,
};