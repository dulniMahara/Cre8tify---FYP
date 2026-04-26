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

// @desc    Get all orders for the admin
// @route   GET /api/orders/all
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email _id')
            .populate('orderItems.product')
            .sort({ createdAt: -1 });
        console.log(`Admin fetched ${orders.length} orders`);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = status;
            await order.save();
            res.json(order);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to update order status" });
    }
};

// @desc    Get all payouts for designers based on approved orders
// @route   GET /api/orders/payouts
const getPayouts = async (req, res) => {
    try {
        const orders = await Order.find({ status: { $ne: 'Cancelled' } }).populate({
            path: 'orderItems.product',
            populate: { path: 'designer', select: 'name email _id' }
        });

        // Group by designer
        const payoutsMap = {};

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product && item.product.designer) {
                    const designerId = item.product.designer._id.toString();
                    if (!payoutsMap[designerId]) {
                        payoutsMap[designerId] = {
                            designer: item.product.designer,
                            totalEarned: 0,
                            salesCount: 0
                        };
                    }
                    // Gross calculation (Markup earned = SalesPrice - BaseCost(850) - 5% PlatformFee)
                    const baseCost = 850;
                    const commission = (item.price - baseCost) * 0.95; 
                    if (commission > 0) {
                        payoutsMap[designerId].totalEarned += (commission * item.qty);
                    }
                    payoutsMap[designerId].salesCount += item.qty;
                }
            });
        });

        res.json(Object.values(payoutsMap));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payouts" });
    }
};

module.exports = { addOrderItems, getMyOrders, getOrders, getPayouts, updateOrderStatus };