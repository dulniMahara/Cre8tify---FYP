const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/cre8tify');
    const Product = require('./models/productModel');
    try {
        const res = await Product.find().select({
            canvasState: 0,
            frontDesign: 0,
            backDesign: 0,
            neckDesign: 0,
            foldedDesign: 0,
            mockupImages: { $slice: 1 }
        }).limit(1);
        console.log("Success! Array length:", res[0] ? res[0].mockupImages?.length : 0);
    } catch(e) {
        console.error("Error:", e.message);
    }
    mongoose.disconnect();
}
test();
