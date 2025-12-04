const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import JWT
const User = require('../models/User'); 

// --- Helper Function: Generate JWT ---
const generateToken = (id) => {
    // Uses the secret key from the .env file
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

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
    password: hashedPassword,
    role: role || 'buyer', 
  });

  // 5. Send back a response with a token
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Attach the token
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email });

  // 2. Check user and password (using bcrypt to compare the hash)
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id), // Send a new token on successful login
    });
  } else {
    res.status(401); // 401: Unauthorized
    throw new Error('Invalid credentials');
  }
});


// Export both functions
module.exports = {
  registerUser,
  loginUser, 
};