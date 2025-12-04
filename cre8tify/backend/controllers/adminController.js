const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Design = require('../models/Design');

// === DESIGN MANAGEMENT FUNCTIONS ===

// @desc    Get all submitted designs pending approval
// @route   GET /api/admin/designs/submitted
// @access  Private/Admin
const getSubmittedDesigns = asyncHandler(async (req, res) => {
  // Find all designs with status 'submitted'
  const designs = await Design.find({ status: 'submitted' }).populate('designer', 'name email').sort({ createdAt: 1 });

  res.status(200).json(designs);
});

// @desc    Approve or reject a design
// @route   PUT /api/admin/designs/:id/status
// @access  Private/Admin
const updateDesignStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const designId = req.params.id;

  if (!status || !['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Please provide a valid status: approved or rejected.');
  }

  const design = await Design.findById(designId);

  if (!design) {
    res.status(404);
    throw new Error('Design not found.');
  }

  // Update the status
  design.status = status;
  await design.save();

  res.status(200).json({ 
    message: `Design ${designId} successfully set to ${status}.`,
    design
  });
});


// === USER MANAGEMENT FUNCTIONS ===

// @desc    Get all users (buyers and designers)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  // Find all users excluding the admin role itself
  const users = await User.find({ role: { $ne: 'admin' } }).select('-password');

  res.status(200).json(users);
});

// @desc    Update a user's role (e.g., promote buyer to designer)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!role || !['buyer', 'designer', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role provided.');
  }

  const user = await User.findById(userId).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  
  // Prevent changing the admin role via this route (for safety)
  if (user.role === 'admin') {
     res.status(403);
     throw new Error('Cannot modify the role of another admin.');
  }

  user.role = role;
  await user.save();

  res.status(200).json(user);
});

// @desc    Approve a designer account (sets isApproved to true)
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
const approveDesigner = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }
    
    // Only approve if they are actually a designer
    if (user.role !== 'designer') {
        res.status(400);
        throw new Error('Only users with the designer role can be approved.');
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({ 
        message: `${user.name} is now an approved designer.`,
        user
    });
});


module.exports = {
  getSubmittedDesigns,
  updateDesignStatus,
  getAllUsers,
  updateUserRole,
  approveDesigner
};