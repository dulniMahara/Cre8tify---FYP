const asyncHandler = require('express-async-handler');
const Design = require('../models/Design');
const User = require('../models/User'); 
// CRITICAL FIX: Import standard fs module
const fs = require('fs'); 

// ----------------------------------------------------------------------
// PRIVATE/DESIGNER ROUTES
// ----------------------------------------------------------------------

// @desc    Create a new design
// @route   POST /api/designs
// @access  Private/Designer
const createDesign = asyncHandler(async (req, res) => {
  // Multer attaches the file info to req.file, and form fields to req.body
  const { title, description, price } = req.body;
  
  // The image path is created by Multer and stored in req.file.path
  const imageUrl = req.file ? req.file.path : null; 

  // 1. Validation for form fields AND the file upload
  if (!title || !description || !price || !imageUrl) {
    
    // If validation fails but a file was uploaded, clean up the file
    if (imageUrl) {
      try {
            // FIX: Use synchronous unlink to simplify and ensure immediate cleanup
            fs.unlinkSync(imageUrl); 
      } catch (error) {
          console.error(`Failed to delete failed upload file: ${imageUrl}`, error);
      }
    }

    res.status(400);
    throw new Error('Please include title, description, price, and upload a design image.');
  }
  
  // We need to convert the price to a number for Mongoose validation/schema
  const numericPrice = parseFloat(price);

  // 2. Create the design
  const design = await Design.create({
    designer: req.user._id, 
    title,
    description,
    imageUrl: imageUrl.replace(/\\/g, '/'), // IMPORTANT: Fix path separators for web use
    price: numericPrice,
    status: 'draft', // New designs start as a draft
  });

  res.status(201).json(design);
});

// @desc    Get all designs created by the logged-in designer
// @route   GET /api/designs/mine
// @access  Private/Designer
const getDesignsByDesigner = asyncHandler(async (req, res) => {
  // Find all designs where the 'designer' field matches the logged-in user's ID
  const designs = await Design.find({ designer: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json(designs);
});

// @desc    Update a designer's own design (only if not yet approved)
// @route   PUT /api/designs/:id
// @access  Private/Designer
const updateDesign = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id);

  if (!design) {
    res.status(404);
    throw new Error('Design not found');
  }

  // Ensure the design belongs to the logged-in designer
  if (design.designer.toString() !== req.user._id.toString()) {
    res.status(401); 
    throw new Error('Not authorized to update this design');
  }

  // Prevent editing if the design is already approved (unless the request is from Admin, which we will handle later)
  if (design.status === 'approved' && req.user.role !== 'admin') {
    res.status(403); 
    throw new Error('Approved designs cannot be edited by the designer.');
  }

  // Update the design with the new data
  const updatedDesign = await Design.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } 
  );

  res.status(200).json(updatedDesign);
});


// @desc    Delete a designer's own design
// @route   DELETE /api/designs/:id
// @access  Private/Designer
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

  // CRITICAL: Delete the associated image file from the server's filesystem
  if (design.imageUrl) {
    try {
      // FIX: Use synchronous unlink
      fs.unlinkSync(design.imageUrl); 
    } catch (error) {
      console.error(`Failed to delete file: ${design.imageUrl}`, error);
    }
  }

  await design.deleteOne();

  res.status(200).json({ success: true, message: 'Design deleted successfully' });
});

// ----------------------------------------------------------------------
// PUBLIC/BUYER ROUTES 
// ----------------------------------------------------------------------

// @desc    Get all approved designs (for the public/buyer)
// @route   GET /api/designs/
// @access  Public
const getAllApprovedDesigns = asyncHandler(async (req, res) => {
  // Find designs where the status is 'approved' and populate the designer's info
  const designs = await Design.find({ status: 'approved' })
    .populate('designer', 'name email') 
    .sort({ createdAt: -1 });

  res.status(200).json(designs);
});


// @desc    Get single design by ID
// @route   GET /api/designs/:id
// @access  Public
const getDesignById = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id).populate('designer', 'name email');

  if (!design) {
    res.status(404);
    throw new Error('Design not found');
  }
  
  // Ensure the public can only view approved designs
  if (design.status !== 'approved') {
    res.status(404);
    throw new Error('Design not found or not approved');
  }

  res.status(200).json(design);
});


// Export all functions
module.exports = {
  createDesign,
  getDesignsByDesigner, // <-- The new, correct name
  updateDesign,
  deleteDesign,
  getAllApprovedDesigns, 
  getDesignById,
};