const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please add a name'], },
    email: { type: String, required: [true, 'Please add an email'], unique: true,},
    password: { type: String, required: [true, 'Please add a password'],},
    role: { type: String,required: true,enum: ['buyer', 'designer', 'admin'], default: 'buyer',},

    // --- FIELDS FOR CUSTOMERS ---
    phone: { type: String,},
    address: { type: String,},
    gender: {type: String,},
    interest: {type: String,},

    // --- 🟢 NEW FIELDS FOR DESIGNERS ---
    brandName: { type: String, },
    bio: { type: String, },

    isApproved: {
        type: Boolean,
        default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);