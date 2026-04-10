const express = require('express');
const router = express.Router();
const { protect, designer } = require('../middleware/authMiddleware'); 
const designCtrl = require('../controllers/designController'); 

// Import Multer upload middleware
const upload = require('../middleware/uploadMiddleware'); 

// Public Routes: Accessible by all users
router.route('/').get(designCtrl.getAllApprovedDesigns);
router.route('/:id').get(designCtrl.getDesignById);

// Private Designer Routes
router.route('/') 
    .post(protect, designer, upload.single('image'), designCtrl.createDesign); 

// Designer Management: Fetching and deleting specific user designs
router.get('/my-designs', protect, designer, designCtrl.getDesignsByDesigner);
router.delete('/:id', protect, designer, designCtrl.deleteDesign);

module.exports = router;