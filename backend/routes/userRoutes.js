const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { registerUser, loginUser, updateUserProfile } = require('../controllers/userController'); 
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser); 

// --- PRIVATE ROUTES ---
router.put('/profile', protect, updateUserProfile);

router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        // 1. Check if file exists (if Multer failed, req.file will be undefined)
        if (!req.file) {
            console.log("No file received by Multer");
            return res.status(400).json({ message: 'No file uploaded or file type not allowed' });
        }

        // 2. We use the 'User' already imported at the top (Removed the extra require here)
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 3. Fix the path formatting
        const filePath = `/${req.file.path.replace(/\\/g, "/")}`; 
        user.profileImage = filePath; 
        
        await user.save();

        res.json({
            message: 'Image uploaded successfully! 📸',
            profileImage: user.profileImage
        });
    } catch (error) {
        // 🟢 Check your terminal! This log will tell you exactly why it failed
        console.error("Upload Error Details:", error); 
        res.status(500).json({ message: 'Server error during upload' });
    }
});

module.exports = router;