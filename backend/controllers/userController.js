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
  // 🟢 Added the extra fields to the destructuring
  const { name, email, password, role, contact, shopName, portfolio, description } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please include all fields: name, email, and password.');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 🟢 Save ALL fields to the database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'buyer',
    phone: contact, // Mapping 'contact' from frontend to 'phone' in DB
    shopName,
    portfolio,
    bio: description // Mapping 'description' from frontend to 'bio' in DB
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // 🟢 Send these back so the frontend can save them to userInfo immediately
      phone: user.phone,
      shopName: user.shopName,
      portfolio: user.portfolio,
      bio: user.bio,
      token: generateToken(user._id),
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
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // 🟢 SEND EVERYTHING BACK TO THE FRONTEND
      phone: user.phone,
      address: user.address,
      shopName: user.shopName,
      portfolio: user.portfolio,
      bio: user.bio,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.interest = req.body.interest || user.interest;
    user.shopName = req.body.shopName || user.shopName; 
    user.portfolio = req.body.portfolio || user.portfolio;
    user.bio = req.body.bio || user.bio;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      interest: updatedUser.interest,
      shopName: updatedUser.shopName, // 🟢 Changed from brandName to shopName
      portfolio: updatedUser.portfolio, // 🟢 Added this line
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage,
      createdAt: updatedUser.createdAt,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// Export both functions
module.exports = {
  registerUser,
  loginUser, 
  updateUserProfile,
};