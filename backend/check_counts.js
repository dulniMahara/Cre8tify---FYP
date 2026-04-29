const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        
        // Check for Product model or create temporary one
        let Product;
        try { Product = mongoose.model('Product'); } 
        catch (e) { Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false })); }

        let Design;
        try { Design = mongoose.model('Design'); } 
        catch (e) { Design = mongoose.model('Design', new mongoose.Schema({}, { strict: false })); }
        
        const productCount = await Product.countDocuments({ status: { $regex: /^pending$/i } });
        const designCount = await Design.countDocuments({ status: { $regex: /^submitted$/i } });
        
        console.log(`Pending Products: ${productCount}`);
        console.log(`Submitted Designs: ${designCount}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
