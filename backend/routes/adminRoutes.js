const express = require('express');
const router = express.Router();
const { protect, admin, authorizeRole } = require('../middleware/authMiddleware');
const {
  getSubmittedDesigns,
  updateDesignStatus,
  getAllUsers,
  updateUserRole,
  approveDesigner
} = require('../controllers/adminController');
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const { getFinancialSummary, getDesignerPayouts, processPayout, refundOrder } = require('../controllers/financialController');

// All routes below are protected and restricted to the 'admin' role
router.use(protect, authorizeRole('admin')); 

// === ORDER MANAGEMENT ROUTES (Requires Admin Role) ===

// GET /api/admin/orders
router.get('/orders', getOrders);

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', updateOrderStatus);

// POST /api/admin/orders/:id/refund
router.post('/orders/:id/refund', refundOrder);

// === FINANCIAL ROUTES (Requires Admin Role) ===

// GET /api/admin/financial/summary
router.get('/financial/summary', getFinancialSummary);

// GET /api/admin/financial/designers
router.get('/financial/designers', getDesignerPayouts);

// POST /api/admin/financial/payout
router.post('/financial/payout', processPayout);

// === DESIGN MANAGEMENT ROUTES (Requires Admin Role) ===

// GET /api/admin/designs/submitted
router.get('/designs/submitted', getSubmittedDesigns);

// PUT /api/admin/designs/:id/status - Approve or Reject a design
router.put('/designs/:id/status', updateDesignStatus);


// === USER MANAGEMENT ROUTES (Requires Admin Role) ===

// GET /api/admin/users - Get all non-admin users
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id/role - Change a user's role (buyer/designer)
router.put('/users/:id/role', updateUserRole);

// PUT /api/admin/users/:id/approve - Approve a designer's account
router.put('/users/:id/approve', approveDesigner);


module.exports = router;