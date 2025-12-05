const express = require('express');
const router = express.Router();
// Assuming you have protect and designer middleware imported
const { protect, designer } = require('../middleware/authMiddleware'); 
const { 
    createDesign, 
    getDesignerDesigns,
    getAllApprovedDesigns, 
    getDesignById,
} = require('../controllers/designController');

// NEW: Import Multer upload middleware
const upload = require('../middleware/uploadMiddleware'); 

// Public Routes (Get Designs)
router.route('/').get(getAllApprovedDesigns);
router.route('/:id').get(getDesignById);

// Private Designer Routes
router.route('/mine')
    .get(protect, designer, getDesignerDesigns); // Get all designs by designer

router.route('/') 
    // ADDED: upload.single('image') handles file upload, 'image' is the field name from the frontend form
    .post(protect, designer, upload.single('image'), createDesign); 

// Private Designer CRUD Routes
// router.route('/:id') 
// .put(protect, designer, updateDesign) 
// .delete(protect, designer, deleteDesign);


module.exports = router;