const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Design = require('../models/Design');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

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

// @desc    Update a user's account status (active/suspended/blocked)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const userId = req.params.id;

    if (!status || !['active', 'suspended', 'blocked'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status provided.');
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    user.accountStatus = status;
    await user.save();

    res.status(200).json(user);
});

// @desc    Reset a user's password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const userId = req.params.id;

    if (!password) {
        res.status(400);
        throw new Error('Please provide a new password.');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
});

// @desc    Get dashboard analytics (Sales, Trending, Growth, Health)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Sales Performance (last 30 days)
  const salesData = await Order.aggregate([
    { $match: { isPaid: true, orderDate: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
        totalRevenue: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 2. User Growth (last 30 days)
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        newUsers: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 3. Trending Products (Top 5 by sales count)
  const trendingProducts = await Product.find({})
    .sort({ salesCount: -1 })
    .limit(5)
    .populate('designer', 'name')
    .select('title salesCount mockupImages designer');

  // 4. Platform-Wide Financials
  const paidOrders = await Order.find({ isPaid: true, isRefunded: false });
  let totalRevenue = 0;
  let platformProfit = 0;
  let totalDesignerEarnings = 0;

  paidOrders.forEach(order => {
      totalRevenue += order.totalPrice;
      order.orderItems.forEach(item => {
          platformProfit += (item.serviceFee || 0) * item.qty;
          totalDesignerEarnings += (item.markup || 0) * item.qty;
      });
  });

  const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
  const totalOrders = await Order.countDocuments({ isPaid: true });

  // 5. Platform Health (To-Do List)
  const pendingDesigns = await Design.countDocuments({ status: 'submitted' });
  const pendingProductApprovals = await Product.countDocuments({ status: 'Pending' });
  const completedOrdersCount = await Order.countDocuments({ status: 'Delivered' });
  const activeOrdersCount = await Order.countDocuments({ status: { $in: ['Processing', 'Shipped'] } });

  res.status(200).json({
    salesData,
    userGrowth,
    trendingProducts,
    financials: {
        totalRevenue,
        platformProfit,
        totalDesignerEarnings,
        totalOrders,
        totalUsers
    },
    health: {
      pendingApprovals: pendingDesigns + pendingProductApprovals,
      completedOrders: completedOrdersCount,
      activeOrders: activeOrdersCount
    }
  });
});

module.exports = {
  getSubmittedDesigns,
  updateDesignStatus,
  getAllUsers,
  updateUserRole,
  approveDesigner,
  updateUserStatus,
  resetUserPassword,
  getAdminAnalytics
};