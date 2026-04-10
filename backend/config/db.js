const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Adding options to help with network resolution
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // 🟢 Forces IPv4, skipping IPv6 issues
      serverSelectionTimeoutMS: 10000, // 🟢 Gives it 10 seconds to find the server
    }); 

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    // If you get a "command not found" error, it means MONGO_URI is undefined
    if (!process.env.MONGO_URI) {
        console.error("DEBUG: Your MONGO_URI is missing. Check your .env file!");
    }
    process.exit(1); 
  }
};

module.exports = connectDB;