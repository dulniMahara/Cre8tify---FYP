const Product = require('../models/productModel');
const { HfInference } = require("@huggingface/inference");

// Initialize Hugging Face with your token from .env
const hf = new HfInference(process.env.HF_TOKEN);

// @desc    Handle AI Virtual Try-On using OOTDiffusion
// @route   POST /api/products/virtual-try-on
const handleVirtualTryOn = async (req, res) => {
    const { personImage, garmentImage } = req.body;

    if (!personImage || !garmentImage) {
        return res.status(400).json({ message: "Both person and garment images are required." });
    }

    try {
        // This is the "Modern Tech" call. It sends your images to the cloud
        // to be re-synthesized into a realistic photo.
        const response = await hf.imageToImage({
            model: "levihsu/OOTDiffusion",
            inputs: {
                image: personImage,
                prompt: "a person wearing a high-quality t-shirt, photorealistic, cinematic lighting",
                negative_prompt: "jagged edges, floating, double collar, blurry, low quality",
            },
        });

        // Convert the raw binary data (Blob) from the AI into a Base64 string
        // so your React frontend can easily display it in an <img> tag.
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

        res.status(200).json({ result: base64Image });
    } catch (error) {
        console.error("HF Inference Error:", error);
        res.status(500).json({
            message: "AI server is currently busy or token is invalid. Please try again in a moment.",
            error: error.message
        });
    }
};

// @desc    Create new product
const createProduct = async (req, res) => {
    const {
        title, description, baseProduct, category, price, markup, mockupImages, canvasState, tshirtColor, allowUserCustomization, allowEditRequests, status,
        frontDesign, frontPrintArea, frontPrintAreaPx,
        backDesign, backPrintArea, backPrintAreaPx,
        neckDesign, neckPrintArea, neckPrintAreaPx,
        foldedDesign, foldedPrintArea, foldedPrintAreaPx
    } = req.body;

    try {
        const product = new Product({
            designer: req.user._id,
            title,
            description,
            baseProduct,
            category: category || 'Unisex',
            price,
            markup,
            mockupImages,
            canvasState,
            tshirtColor,
            allowCustomization: allowUserCustomization,
            allowEditRequests,
            status: status || 'Pending',
            isApproved: false,

            // 🟢 Design Data
            frontDesign, frontPrintArea, frontPrintAreaPx,
            backDesign, backPrintArea, backPrintAreaPx,
            neckDesign, neckPrintArea, neckPrintAreaPx,
            foldedDesign, foldedPrintArea, foldedPrintAreaPx
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all approved products (with optional category filter)
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let query = { status: 'Approved' };
        
        if (category && category !== 'All') {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        const products = await Product.find(query)
            .populate('designer', 'name shopName bio profileImage')
            .sort({ createdAt: -1 });
            
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
};

// @desc    Get all designs for the logged-in designer
const getDesignerProducts = async (req, res) => {
    try {
        const products = await Product.find({ designer: req.user._id })
            .populate('designer', 'name shopName bio profileImage')
            .sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your designs" });
    }
};

// @desc    Get all pending products for Admin review
const getPendingProducts = async (req, res) => {
    try {
        console.log("[ProductController] Admin fetching pending products...");
        // Use case-insensitive search just in case
        const products = await Product.find({ 
            status: { $regex: /^pending$/i } 
        })
        .populate({
            path: 'designer',
            select: 'name email shopName'
        })
        .sort({ createdAt: -1 })
        .lean(); // Use lean for faster, read-only results
        
        console.log(`[ProductController] Found ${products ? products.length : 0} pending products.`);
        res.status(200).json(products || []);
    } catch (error) {
        console.error("[ProductController] ERROR fetching pending:", error);
        res.status(500).json({ 
            message: "Server Error while fetching pending products", 
            error: error.message 
        });
    }
};

const Notification = require('../models/notificationModel');

// @desc    Approve or Reject a product (Admin Action)
const updateProductStatus = async (req, res) => {
    const { status, rejectionReason } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.status = status;

        if (status === 'Approved') {
            product.isApproved = true;
            product.rejectionReason = "";
        } else if (status === 'Rejected') {
            product.isApproved = false;
            product.rejectionReason = rejectionReason || "No reason provided.";
        }

        await product.save();

        // 🔔 Create Notification for Designer
        await Notification.create({
            user: product.designer,
            title: `Design ${status}`,
            message: status === 'Approved' 
                ? `Great news! Your design "${product.title}" has been approved and is now live in the collection.`
                : `Your design "${product.title}" was not approved. Reason: ${rejectionReason || "Please check details in My Shop."}`,
            type: 'status_update'
        });

        res.json({ message: `Product ${status} successfully`, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getDesignerProducts,
    getPendingProducts,
    updateProductStatus,
    handleVirtualTryOn
};