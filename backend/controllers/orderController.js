const Order = require('../models/orderModel');

// @desc    Create a new order after "Confirm & Pay"
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
    const { orderItems, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No items in your cart' });
    }

    try {
        const order = new Order({
            user: req.user._id, // This comes from your authMiddleware
            orderItems,
            totalPrice,
            status: 'Processing' 
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
    try {
        // We find orders belonging only to the user currently logged in
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

module.exports = { addOrderItems, getMyOrders };