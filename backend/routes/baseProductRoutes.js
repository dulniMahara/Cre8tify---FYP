const express = require('express');
const router = express.Router();
const BaseProduct = require('../models/baseProductModel');

// @route   GET /api/base-products
// @desc    Get all base products
router.get('/', async (req, res) => {
    try {
        const products = await BaseProduct.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/base-products/:name
// @desc    Get specs for a specific blank product
router.get('/:name', async (req, res) => {
    try {
        const name = req.params.name;
        if (!name) return res.status(400).json({ message: "No name provided" });
        
        const product = await BaseProduct.findOne({ name });
        if (product) {
            res.json(product);
        } else {
            // Fallback if not found in DB yet
            res.json({
                name,
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



// @route   POST /api/base-products
// @desc    Admin create new base product
router.post('/', async (req, res) => {
    try {
        const product = new BaseProduct(req.body);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/base-products/:id
// @desc    Update a base product
router.put('/:id', async (req, res) => {
    try {
        const product = await BaseProduct.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/base-products/:id
// @desc    Delete a base product
router.delete('/:id', async (req, res) => {
    try {
        const product = await BaseProduct.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: "Product removed" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;