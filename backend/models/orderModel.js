const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        basePrice: { type: Number, default: 1200 },
        markup: { type: Number, default: 0 },
        serviceFee: { type: Number, default: 100 },
        size: { type: String },
        color: { type: String },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    }],
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentMethod: { type: String, default: 'card' },
    isRefunded: { type: Boolean, default: false },
    refundedAt: { type: Date },
    status: { type: String, default: 'Processing' }, // 'Processing', 'Delivered', 'Cancelled', 'Refunded'
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);