const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const {
  getSubmittedDesigns,
  updateDesignStatus,
  getAllUsers,
  updateUserRole,
  approveDesigner
} = require('../controllers/adminController');


// All routes below are protected and restricted to the 'admin' role
router.use(protect, authorizeRole('admin')); 

// === DESIGN MANAGEMENT ROUTES (Requires Admin Role) ===

// GET /api/admin/designs/submitted
router.get('/designs/submitted', getSubmittedDesigns);

// PUT /api/admin/designs/:id/status - Approve or Reject a design
router.put('/designs/:id/status', updateDesignStatus);


// === USER MANAGEMENT ROUTES (Requires Admin Role) ===

// GET /api/admin/users - Get all non-admin users
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id/role - Change a user's role (buyer/designer)
router.put('/users/:id/role', updateUserRole);

// PUT /api/admin/users/:id/approve - Approve a designer's account
router.put('/users/:id/approve', approveDesigner);


module.exports = router;