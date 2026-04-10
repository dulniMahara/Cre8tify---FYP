const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    createProduct, 
    getDesignerProducts, 
    getPendingProducts, 
    updateProductStatus,
    handleVirtualTryOn // 👈 ADD THIS HERE
} = require('../controllers/productController');

// Designer Routes
router.post('/', protect, createProduct);
router.get('/my-designs', protect, getDesignerProducts);

// Customer Routes
// 🎯 This is your AI Try-On endpoint
router.post('/virtual-try-on', handleVirtualTryOn);

// 🟢 Admin Approval Routes
router.get('/admin/pending', protect, getPendingProducts);
router.put('/:id/status', protect, updateProductStatus);

module.exports = router;