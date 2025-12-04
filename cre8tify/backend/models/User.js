const mongoose = require('mongoose');

// Define the structure (schema) for a User
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // Ensures no two users share the same email
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    // The role field identifies the type of user
    role: {
      type: String,
      required: true,
      // Roles: buyer, designer, or admin
      enum: ['buyer', 'designer', 'admin'], 
      default: 'buyer', // Most registrations will default to a buyer
    },
    // Added for the Admin to approve new designers
    isApproved: {
        type: Boolean,
        default: false,
    }
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Export the model so we can use it in other parts of the application
module.exports = mongoose.model('User', userSchema);