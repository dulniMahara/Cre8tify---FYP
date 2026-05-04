const Order = require('../models/orderModel');
const Notification = require('../models/notificationModel');
const Product = require('../models/productModel');

// @desc    Create a new order after "Confirm & Pay"
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
    const { orderItems, totalPrice, shippingAddress, paymentMethod, isPaid, paidAt, status } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No items in your cart' });
    }

    try {
        const Settings = require('../models/Settings');
        const settings = await Settings.find({});
        
        const getVal = (key, fallback) => {
            const s = settings.find(st => st.key === key);
            return s ? s.value : fallback;
        };

        const taxRate = getVal('tax_rate', 0.05);
        const shippingFee = getVal('base_shipping_fee', 300);
        
        let totalDesignerEarnings = 0;
        let totalPlatformProfit = 0;
        
        orderItems.forEach(item => {
            // Standard Markup
            totalDesignerEarnings += (item.markup || 0) * item.qty;
            
            // Standard Service Fee (Platform)
            totalPlatformProfit += (item.serviceFee || 0) * item.qty;

            // Customization Extra Split (300 LKR: 100 for Designer, 200 for Platform)
            if (item.isCustom && item.customizationFee) {
                totalDesignerEarnings += (item.customizationFee * (1/3)) * item.qty;
                totalPlatformProfit += (item.customizationFee * (2/3)) * item.qty;
            }
        });

        const taxAmount = totalPrice * taxRate;

        const order = new Order({
            user: req.user._id,
            orderItems,
            totalPrice,
            shippingAddress: shippingAddress || '',
            shippingFee,
            taxAmount,
            platformProfit: totalPlatformProfit,
            designerEarnings: totalDesignerEarnings,
            paymentMethod: paymentMethod || 'card',
            isPaid: isPaid || false,
            paidAt: isPaid ? (paidAt || new Date()) : undefined,
            status: status || 'Processing'
        });

        const createdOrder = await order.save();

        // 🟢 1. Notify Buyer — safe, no external lookups
        try {
            await Notification.create({
                user: req.user._id,
                title: "Order Placed Successfully!",
                message: `Your order #${createdOrder._id.toString().substring(16).toUpperCase()} has been placed. Total: LKR ${totalPrice.toLocaleString('en-US')}`,
                type: 'order_placed',
                orderId: createdOrder._id
            });
        } catch (notifyErr) {
            console.warn("[OrderController] Buyer notification failed:", notifyErr.message);
        }

        // 🟢 2. Notify Designers — guard each item individually
        const mongoose = require('mongoose');
        const designerIds = new Set();

        for (const item of orderItems) {
            try {
                if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
                    const product = await Product.findById(item.product).select('designer');
                    if (product && product.designer) {
                        designerIds.add(product.designer.toString());
                    }
                }
            } catch (lookupErr) {
                console.warn(`[OrderController] Product lookup failed for ${item.product}:`, lookupErr.message);
            }
        }

        for (const designerId of designerIds) {
            try {
                await Notification.create({
                    user: designerId,
                    title: "New Order Received!",
                    message: `An order has been placed for your design by ${req.user.name || 'a customer'}.`,
                    type: 'order_received',
                    orderId: createdOrder._id
                });
            } catch (notifyErr) {
                console.warn(`[OrderController] Designer notification failed for ${designerId}:`, notifyErr.message);
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        
        if (order) {
            // Check if order belongs to the user or if user is admin
            if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: "Not authorized" });
            }
            res.json(order);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
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
        console.log("[OrderController] Admin fetching all orders...");
        const orders = await Order.find({})
            .populate('user', 'name email _id')
            .populate({
                path: 'orderItems.product',
                select: 'title price tshirtColor'
            })
            .sort({ createdAt: -1 });
        
        console.log(`[OrderController] Admin fetched ${orders ? orders.length : 0} orders`);
        res.json(orders || []);
    } catch (error) {
        console.error("[OrderController] Critical Error in getOrders:", error);
        res.status(500).json({ message: "Failed to fetch all orders", error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        console.log(`[OrderController] Updating order ${req.params.id} to status: ${status}`);
        
        // Using findByIdAndUpdate with runValidators: false to bypass validation issues with old test data
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: false }
        );

        if (order) {
            console.log(`[OrderController] Order ${order._id} status updated to ${status}`);
            
            // 🟢 Notify Customer about status change
            if (order.user) {
                try {
                    await Notification.create({
                        user: order.user,
                        title: "Order Status Updated",
                        message: `Your order #${order._id.toString().substring(16).toUpperCase()} is now ${status}.`,
                        type: 'status_update',
                        orderId: order._id
                    });
                } catch (notifyErr) {
                    console.warn("[OrderController] Status update notification failed:", notifyErr.message);
                }
            }
            
            res.json(order);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error("[OrderController] Status Update Critical Error:", error);
        res.status(500).json({ message: "Failed to update order status", error: error.message });
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
                    // Standardized calculation using persistent database fields
                    const markup = item.markup || 0;
                    const customizationEarning = (item.isCustom && item.customizationFee) ? (item.customizationFee * (1/3)) : 0;
                    const totalItemEarnings = (markup + customizationEarning) * item.qty;
                    
                    payoutsMap[designerId].totalEarned += totalItemEarnings;
                    payoutsMap[designerId].salesCount += item.qty;
                }
            });
        });

        res.json(Object.values(payoutsMap));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payouts" });
    }
};

module.exports = { addOrderItems, getMyOrders, getOrders, getPayouts, updateOrderStatus, getOrderById };