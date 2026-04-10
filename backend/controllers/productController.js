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
    const { title, description, baseProduct, price, markup, mockupImages, canvasState, allowCustomization, status } = req.body;

    try {
        const product = new Product({
            designer: req.user._id, 
            title,
            description,
            baseProduct,
            price,
            markup,
            mockupImages,
            canvasState,
            allowCustomization,
            status: status || 'Pending', 
            isApproved: false 
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all designs for the logged-in designer
const getDesignerProducts = async (req, res) => {
    try {
        const products = await Product.find({ designer: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your designs" });
    }
};

// @desc    Get all pending products for Admin review
const getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'Pending' })
            .populate('designer', 'name email') 
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

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
        res.json({ message: `Product ${status} successfully`, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createProduct, 
    getDesignerProducts, 
    getPendingProducts, 
    updateProductStatus,
    handleVirtualTryOn 
};