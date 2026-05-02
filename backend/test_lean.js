const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('./models/productModel');
    console.log('Connected. Fetching 10 products...');
    
    let st = Date.now();
    let p = await Product.find().select('-canvasState -frontDesign -backDesign -neckDesign -foldedDesign').limit(10);
    console.log('Time (normal):', Date.now()-st, 'ms');
    
    st = Date.now();
    p = await Product.find().select('-canvasState -frontDesign -backDesign -neckDesign -foldedDesign').limit(10).lean();
    console.log('Time (lean):', Date.now()-st, 'ms');

    mongoose.disconnect();
}
check();
