const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    designer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who processed it
    note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
