const asyncHandler = require('express-async-handler'); // Helper to handle async errors
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../models/User'); // Import the User Model

// @desc    Register a new user (buyer or designer)
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Check if all required fields are present
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please include all fields: name, email, and password.');
  }

  // 2. Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 3. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Create the User in MongoDB
  const user = await User.create({
    name,
    email,
    password: hashedPassword, // Store the hashed password
    role: role || 'buyer', // Default to 'buyer' if role is not specified
    // isApproved defaults to 'false' for designers, as per the model
  });

  // 5. Send back a response
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


// We will add the login function here later...


// Export the function so it can be used in the router
module.exports = {
  registerUser,
};