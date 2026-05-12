const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure Multer for saving bank deposit slips
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

const { addOrderItems, getMyOrders, getOrders, getPayouts, updateOrderStatus, getOrderById } = require('../controllers/orderController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Admin Routes
router.route('/all').get(protect, authorizeRole('admin'), getOrders);
router.route('/payouts').get(protect, authorizeRole('admin'), getPayouts);
router.route('/:id/status').put(protect, authorizeRole('admin'), updateOrderStatus);

// Both routes are 'protected' because only a logged-in user can buy or see their orders
router.route('/').post(protect, upload.single('paymentSlip'), addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);

module.exports = router;