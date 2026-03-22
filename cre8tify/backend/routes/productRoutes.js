const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    createProduct, 
    getDesignerProducts, 
    getPendingProducts, 
    updateProductStatus 
} = require('../controllers/productController');

// Designer Routes
router.post('/', protect, createProduct);
router.get('/my-designs', protect, getDesignerProducts);

// 🟢 Admin Approval Routes
router.get('/admin/pending', protect, getPendingProducts);
router.put('/:id/status', protect, updateProductStatus);

module.exports = router;