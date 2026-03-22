const Product = require('../models/productModel');

// @desc    Create new product
// @route   POST /api/products
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
// @route   GET /api/products/my-designs
const getDesignerProducts = async (req, res) => {
    try {
        const products = await Product.find({ designer: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your designs" });
    }
};

// @desc    Get all pending products for Admin review
// @route   GET /api/products/admin/pending
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
// @route   PUT /api/products/:id/status
const updateProductStatus = async (req, res) => {
    const { status, rejectionReason } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.status = status;
        
        if (status === 'Approved') {
            product.isApproved = true;
            product.rejectionReason = ""; // Clear reason if it was previously rejected
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
    updateProductStatus 
};