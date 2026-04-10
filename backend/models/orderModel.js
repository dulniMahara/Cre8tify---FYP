const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true }, // This stores the URL/Base64 of the CUSTOM design
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    }],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Processing' }, // 'Processing', 'Delivered'
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);