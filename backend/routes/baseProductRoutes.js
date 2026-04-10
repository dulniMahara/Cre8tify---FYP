const express = require('express');
const router = express.Router();
const BaseProduct = require('../models/baseProductModel');

// @route   GET /api/base-products/:name
// @desc    Get specs for a specific blank product
router.get('/:name', async (req, res) => {
    try {
        const product = await BaseProduct.findOne({ name: req.params.name });
        if (product) {
            res.json(product);
        } else {
            // Fallback if not found in DB yet
            res.json({
                name: req.params.name,
                material: "Premium Cotton",
                gsm: "200 GSM",
                fit: "Standard Fit",
                printSize: "4200 x 4800 px"
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;