const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('./models/productModel');
    console.log('Connected. Fetching...');
    
    // Test 1: Fetch with only exclusions
    let st = Date.now();
    let p = await Product.find().select('-canvasState -frontDesign -backDesign -neckDesign -foldedDesign').limit(1);
    console.log('Time (exclusions only):', Date.now()-st, 'ms');
    console.log('Size bytes:', Buffer.byteLength(JSON.stringify(p)));
    
    // Test 2: Fetch with slice
    st = Date.now();
    p = await Product.find().select({ canvasState: 0, frontDesign: 0, backDesign: 0, neckDesign: 0, foldedDesign: 0, mockupImages: { $slice: 1 } }).limit(1);
    console.log('Time (with slice):', Date.now()-st, 'ms');
    console.log('Size bytes:', Buffer.byteLength(JSON.stringify(p)));

    mongoose.disconnect();
}
check();
