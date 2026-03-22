const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    designer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    baseProduct: { type: String, required: true }, 
    category: { type: String, default: 'Unisex' },
    price: { type: Number, required: true },
    markup: { type: Number, required: true },
    
    // 🟢 The "Snapshot" images for the shop display
    mockupImages: [{ type: String }], 

    // 🟢 The "Source Code" of the design (Canvas Layers)
    canvasState: {
        imageLayers: { type: Array, default: [] },
        textLayer: { type: Array, default: [] }
    },

    status: { 
        type: String, 
        enum: ['Draft', 'Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },

    // 🟢 SALES & PERMISSIONS
    salesCount: { 
        type: Number, 
        default: 0 
    },

    isApproved: { 
        type: Boolean, 
        default: false 
    },

    allowCustomization: { 
        type: Boolean, 
        default: true 
    },

    rejectionReason: { // 🟢 Added this so the Admin can save why they rejected it
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);