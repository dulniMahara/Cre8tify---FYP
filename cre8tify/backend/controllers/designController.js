const asyncHandler = require('express-async-handler');
const Design = require('../models/Design');
const User = require('../models/User'); // Needed to check user role/status

// @desc    Create a new design
// @route   POST /api/designs
// @access  Private/Designer
const createDesign = asyncHandler(async (req, res) => {
  // Designer ID is attached to req.user by the 'protect' middleware
  const { title, description, imageUrl, price } = req.body;

  // 1. Basic validation
  if (!title || !description || !imageUrl || !price) {
    res.status(400);
    throw new Error('Please include title, description, imageUrl, and price.');
  }

  // 2. Create the design
  const design = await Design.create({
    designer: req.user._id, // Set the designer to the logged-in user
    title,
    description,
    imageUrl,
    price,
    status: 'draft', // New designs start as a draft
  });

  res.status(201).json(design);
});

// @desc    Get all designs created by the logged-in designer
// @route   GET /api/designs/mine
// @access  Private/Designer
const getDesignerDesigns = asyncHandler(async (req, res) => {
  // Find all designs where the 'designer' field matches the logged-in user's ID
  const designs = await Design.find({ designer: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json(designs);
});

// @desc    Update a designer's own design (only if not yet approved)
// @route   PUT /api/designs/:id
// @access  Private/Designer
const updateDesign = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id);

  if (!design) {
    res.status(404);
    throw new Error('Design not found');
  }

  // Ensure the design belongs to the logged-in designer
  if (design.designer.toString() !== req.user._id.toString()) {
    res.status(401); // 401: Unauthorized
    throw new Error('Not authorized to update this design');
  }

  // Prevent editing if the design is already approved (unless the request is from Admin, which we will handle later)
  if (design.status === 'approved' && req.user.role !== 'admin') {
    res.status(403); // 403: Forbidden
    throw new Error('Approved designs cannot be edited by the designer.');
  }

  // Update the design with the new data
  const updatedDesign = await Design.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } // returns the updated document
  );

  res.status(200).json(updatedDesign);
});


// @desc    Delete a designer's own design
// @route   DELETE /api/designs/:id
// @access  Private/Designer
const deleteDesign = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id);

  if (!design) {
    res.status(404);
    throw new Error('Design not found');
  }

  // Ensure the design belongs to the logged-in designer
  if (design.designer.toString() !== req.user._id.toString()) {
    res.status(401); 
    throw new Error('Not authorized to delete this design');
  }

  await design.deleteOne();

  res.status(200).json({ success: true, message: 'Design deleted successfully' });
});


// Export all functions
module.exports = {
  createDesign,
  getDesignerDesigns,
  updateDesign,
  deleteDesign,
};