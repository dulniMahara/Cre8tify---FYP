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
  requestType: { type: String, enum: ['fulfillment', 'customization'], default: 'fulfillment' }, // 🟢 Added to distinguish flows
  size: { type: String }, // Added for customization tracking

  // Designer fulfillment fields
  designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  designerName: { type: String },
  frontDesign: { type: String }, // Final design image captured from Design Tool
  previewSnapshot: { type: String }, // Full composited snapshot: mockup + color + design layers
  frontPrintArea: { type: Object }, // Store the print area configuration
  canvasState: {
    imageLayers: { type: Array, default: [] },
    textLayers: { type: Array, default: [] }
  }, // Store editable layers
  finalPrice: { type: Number },
  price: { type: Number }, // 🟢 Added for customization total price storage
  rejectionReason: { type: String },
  isOfferSent: { type: Boolean, default: false },

  submittedOn: { type: String, default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);