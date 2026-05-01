const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createProduct,
    getProducts,
    getDesignerProducts,
    getPendingProducts,
    updateProductStatus,
    handleVirtualTryOn,
    deleteProduct
} = require('../controllers/productController');

// Public Routes
router.get('/', getProducts);

// Designer Routes
router.post('/', protect, createProduct);
router.get('/my-designs', protect, getDesignerProducts);

// Customer Routes
// 🎯 This is your AI Try-On endpoint
router.post('/virtual-try-on', handleVirtualTryOn);

// 🟢 Admin Approval Routes
router.get('/admin/pending', protect, getPendingProducts);
router.put('/:id/status', protect, updateProductStatus);
router.delete('/:id', protect, deleteProduct);

module.exports = router;