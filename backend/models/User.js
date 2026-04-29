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
    shopName: { type: String, },
    brandName: { type: String, },
    bio: { type: String, },
    profileImage: { type: String, },
    portfolio: { type: String, },

    isApproved: {
        type: Boolean,
        default: false,
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'blocked'],
        default: 'active',
    },
    securityLogs: [
        {
            event: String,
            ip: String,
            location: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);