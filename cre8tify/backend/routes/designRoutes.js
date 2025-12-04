const express = require('express');
const router = express.Router();
const { 
    createDesign, 
    getDesignerDesigns, 
    updateDesign, 
    deleteDesign,
    getAllApprovedDesigns, // NEW
    getDesignById         // NEW
} = require('../controllers/designController'); 
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Base URL is /api/designs

// --- Public Routes (Buyers / Everyone) ---
// GET /api/designs - Get all approved designs
router.get('/', getAllApprovedDesigns);
// GET /api/designs/:id - Get single design details
router.get('/:id', getDesignById);


// --- Designer/Admin Routes (Protected) ---
// POST /api/designs - Create a new design (Designer only)
router.post(
  '/', 
  protect, 
  authorizeRole('designer'), 
  createDesign
);

// GET /api/designs/mine - Get all designs created by the logged-in designer (Designer only)
router.get(
  '/mine', 
  protect, 
  authorizeRole('designer'), 
  getDesignerDesigns
);

// PUT and DELETE requests require the design ID in the URL
router.route('/:id')
  // PUT /api/designs/:id - Update a design (Designer only)
  .put(protect, authorizeRole('designer'), updateDesign)
  // DELETE /api/designs/:id - Delete a design (Designer only)
  .delete(protect, authorizeRole('designer'), deleteDesign);


module.exports = router;