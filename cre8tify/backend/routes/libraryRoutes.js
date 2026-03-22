const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const Library = require('../models/libraryModel');

// 1. Configure Multer to save in the specific library folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/library/');
    },
    filename: (req, file, cb) => {
        cb(null, `asset-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// 2. Define the Routes

// @route   POST /api/library
// @desc    Upload an image to designer library
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newItem = await Library.create({
            user: req.user._id,
            name: req.file.originalname,
            url: `/uploads/library/${req.file.filename}`
        });

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/library
// @desc    Get all images for the logged-in designer
router.get('/', protect, async (req, res) => {
    try {
        const items = await Library.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/library/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const item = await Library.findById(req.params.id);
        if (item && item.user.toString() === req.user._id.toString()) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;