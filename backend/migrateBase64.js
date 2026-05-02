const mongoose = require('mongoose');
require('dotenv').config();
const saveBase64ToFile = require('./utils/base64ToFile');
const Product = require('./models/productModel');

async function runMigration() {
    console.log("Connecting to MongoDB...", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    try {
        const products = await Product.find();
        console.log(`Found ${products.length} products to migrate.`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            console.log(`Processing product ${i + 1}/${products.length}: ${product._id}`);
            let changed = false;

            // 1. Process mockupImages
            if (product.mockupImages && Array.isArray(product.mockupImages)) {
                for (let j = 0; j < product.mockupImages.length; j++) {
                    if (product.mockupImages[j].startsWith('data:image')) {
                        product.mockupImages[j] = saveBase64ToFile(product.mockupImages[j]);
                        changed = true;
                    }
                }
            }

            // 2. Process side designs
            const designFields = ['frontDesign', 'backDesign', 'neckDesign', 'foldedDesign'];
            for (const field of designFields) {
                if (product[field] && product[field].startsWith('data:image')) {
                    product[field] = saveBase64ToFile(product[field]);
                    changed = true;
                }
            }

            // 3. Process canvasState image layers
            if (product.canvasState && product.canvasState.imageLayers && Array.isArray(product.canvasState.imageLayers)) {
                for (let j = 0; j < product.canvasState.imageLayers.length; j++) {
                    const layer = product.canvasState.imageLayers[j];
                    if (layer && layer.src && layer.src.startsWith('data:image')) {
                        layer.src = saveBase64ToFile(layer.src, 'canvas_layers');
                        changed = true;
                    }
                }
                // Mongoose might not detect changes in nested arrays natively sometimes
                if (changed) {
                    product.markModified('canvasState');
                }
            }

            if (changed) {
                await product.save();
                console.log(`✅ Saved migrated product ${product._id}`);
            } else {
                console.log(`- No base64 fields found in product ${product._id}`);
            }
        }
        console.log("Migration completed successfully.");

    } catch (err) {
        console.error("Migration failed:", err);
    }

    mongoose.disconnect();
}

runMigration();
