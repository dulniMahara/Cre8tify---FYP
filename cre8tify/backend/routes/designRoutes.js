const express = require('express');
const router = express.Router();
// Assuming you have protect and designer middleware imported
const { protect, designer } = require('../middleware/authMiddleware'); 

// CRITICAL FIX: Import the entire controller object
const designCtrl = require('../controllers/designController'); 

// Import Multer upload middleware
const upload = require('../middleware/uploadMiddleware'); 

// Public Routes (Get Designs)
// FIX: Call the functions using the imported object (designCtrl.functionName)
router.route('/').get(designCtrl.getAllApprovedDesigns);
router.route('/:id').get(designCtrl.getDesignById);

// Private Designer Routes

router.route('/') 
    // FIX: Call the function using the imported object
    .post(protect, designer, upload.single('image'), designCtrl.createDesign); 

// Matches: GET /api/designs/my-designs (Used by MyDesigns.tsx)
router.get('/my-designs', protect, designer, designCtrl.getDesignsByDesigner);

// Matches: DELETE /api/designs/:id (Used by the delete button in MyDesigns.tsx)
router.delete('/:id', protect, designer, designCtrl.deleteDesign);

// Private Designer CRUD Routes
// router.route('/:id') 
// .put(protect, designer, designCtrl.updateDesign) 
// .delete(protect, designer, designCtrl.deleteDesign);


module.exports = router;