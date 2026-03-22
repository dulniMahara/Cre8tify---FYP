const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  customerName: { type: String }, // Optional: link to User ID if logged in
  preferredChanges: { type: String, required: true },
  preferredTime: { type: String },
  additionalInfo: { type: String },
  status: { type: String, default: 'Pending' }, // Pending, Accepted, Completed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);