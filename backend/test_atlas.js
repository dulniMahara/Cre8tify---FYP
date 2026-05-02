const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    console.log("Connecting to", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");
    const Product = require('./models/productModel');
    try {
        console.log("Fetching products...");
        const res = await Product.find().select({
            canvasState: 0,
            frontDesign: 0,
            backDesign: 0,
            neckDesign: 0,
            foldedDesign: 0,
            mockupImages: { $slice: 1 }
        }).limit(1);
        console.log("Success! Fetched", res.length, "items.");
    } catch(e) {
        console.error("Error:", e.message);
    }
    mongoose.disconnect();
}
test();
