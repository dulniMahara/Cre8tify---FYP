const mongoose = require('mongoose');

const baseProductSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Women Boxy T-shirt"
    material: { type: String, required: true },         // e.g., "100% Ring-Spun Cotton"
    gsm: { type: String, required: true },              // e.g., "240 GSM"
    fit: { type: String, required: true },              // e.g., "Boxy / Street-style"
    description: { type: String },
    printSize: { type: String, default: "4200 x 4800 px" },
    basePrice: { type: Number, default: 850 },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    image: { type: String, required: false },
    category: { type: String, enum: ['Women', 'Men', 'Kids', 'Unisex'], default: 'Unisex' }
}, { timestamps: true });

module.exports = mongoose.model('BaseProduct', baseProductSchema);