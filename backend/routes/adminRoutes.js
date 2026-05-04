const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const { getFinancialSummary, getDesignerPayouts, processPayout, refundOrder, getDesignerFinancialDetails } = require('../controllers/financialController');

// All routes below are protected and restricted to the 'admin' role
router.use(protect, authorizeRole('admin')); 

// === ORDER MANAGEMENT ROUTES ===
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', refundOrder);

// === FINANCIAL ROUTES ===
router.get('/financial/summary', getFinancialSummary);
router.get('/financial/designers', getDesignerPayouts);
router.get('/financial/designers/:id', getDesignerFinancialDetails);
router.post('/financial/payout', processPayout);

// === DESIGN MANAGEMENT ROUTES ===
router.get('/designs/submitted', adminController.getSubmittedDesigns);
router.put('/designs/:id/status', adminController.updateDesignStatus);

// === USER MANAGEMENT ROUTES ===
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/approve', adminController.approveDesigner);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// === ANALYTICS ROUTES ===
router.get('/analytics', adminController.getAdminAnalytics);

// === SETTINGS ROUTES ===
router.get('/settings', adminController.getSettings);
router.put('/settings/:key', adminController.updateSetting);

module.exports = router;