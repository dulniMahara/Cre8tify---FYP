const mongoose = require('mongoose');

const designSchema = mongoose.Schema(
  {
    // The Designer who created this design
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Links this design to a specific user (the designer)
    },
    title: {
      type: String,
      required: [true, 'Please add a title for the design'],
    },
    description: {
      type: String,
      required: [true, 'Please add a brief description'],
    },
    // The Cloudinary URL for the main design image (you will implement Cloudinary later)
    imageUrl: { 
      type: String,
      required: true,
    },
    // The price set by the designer for their work
    price: {
      type: Number,
      required: [true, 'Please set a price for the design'],
      default: 0,
    },
    // Status to track Admin approval
    status: {
      type: String,
      required: true,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft', // Default is 'draft' until the designer submits it
    },
    // Count of likes given by buyers (Users)
    likesCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true, // Auto-tracks creation and update times
  }
);

// Export the model
module.exports = mongoose.model('Design', designSchema);