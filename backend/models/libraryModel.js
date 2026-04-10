const mongoose = require('mongoose');

const librarySchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true }, // Path to the file in uploads/library/
}, { timestamps: true });

module.exports = mongoose.model('Library', librarySchema);