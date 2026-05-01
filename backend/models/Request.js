const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  productId: { type: String },
  productName: { type: String },
  productImage: { type: String }, // Base mockup image URL or path
  customer: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String }, // User's custom request description
  preferredTime: { type: String },
  extraNote: { type: String },
  referenceImage: { type: String }, // URL/Base64 for user-uploaded reference
  color: { type: String }, // Selected shirt color
  status: { type: String, default: 'Pending' }, // 'Pending', 'Accepted', 'Completed', 'Rejected'
  
  // Designer fulfillment fields
  designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  designerName: { type: String },
  frontDesign: { type: String }, // Final design image captured from Design Tool
  finalPrice: { type: Number },
  rejectionReason: { type: String },
  isOfferSent: { type: Boolean, default: false },

  submittedOn: { type: String, default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);