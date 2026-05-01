const Order = require('../models/orderModel');
const Payout = require('../models/payoutModel');
const User = require('../models/User');

// @desc    Get financial summary (Revenue, Pending Payouts, Platform Profit)
// @route   GET /api/admin/financial/summary
const getFinancialSummary = async (req, res) => {
    try {
        const orders = await Order.find({ isPaid: true, isRefunded: false });
        
        let totalRevenue = 0;
        let platformProfit = 0;
        let totalDesignerEarnings = 0;

        orders.forEach(order => {
            totalRevenue += order.totalPrice;
            order.orderItems.forEach(item => {
                // Platform profit = serviceFee * qty
                platformProfit += (item.serviceFee || 0) * item.qty;
                // Designer earnings = markup * qty
                totalDesignerEarnings += (item.markup || 0) * item.qty;
            });
        });

        // Get total amount already paid to designers
        const totalPaidOut = await Payout.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const alreadyPaid = totalPaidOut.length > 0 ? totalPaidOut[0].total : 0;
        const pendingPayouts = totalDesignerEarnings - alreadyPaid;

        res.json({
            totalRevenue,
            platformProfit,
            pendingPayouts: Math.max(0, pendingPayouts),
            totalDesignerEarnings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get designer payout statistics
// @route   GET /api/admin/financial/designers
const getDesignerPayouts = async (req, res) => {
    try {
        const orders = await Order.find({ isPaid: true, isRefunded: false })
            .populate({
                path: 'orderItems.product',
                populate: { path: 'designer', select: 'name email _id' }
            });

        const designerMap = {};

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                // We need the designer ID. 
                // Note: product could be a mock ID string (e.g. "1"), so populate might fail.
                // We should check if item.product is a populated object.
                if (item.product && typeof item.product === 'object' && item.product.designer) {
                    const dId = item.product.designer._id.toString();
                    if (!designerMap[dId]) {
                        designerMap[dId] = {
                            id: dId,
                            name: item.product.designer.name,
                            email: item.product.designer.email,
                            totalEarned: 0,
                            alreadyPaid: 0,
                            balance: 0
                        };
                    }
                    designerMap[dId].totalEarned += (item.markup || 0) * item.qty;
                }
            });
        });

        // Subtract amounts already paid from Payouts table
        const allPayouts = await Payout.find({});
        allPayouts.forEach(p => {
            const dId = p.designer.toString();
            if (designerMap[dId]) {
                designerMap[dId].alreadyPaid += p.amount;
            }
        });

        // Calculate final balance
        const result = Object.values(designerMap).map(d => ({
            ...d,
            balance: Math.max(0, d.totalEarned - d.alreadyPaid)
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Process a payout to a designer
// @route   POST /api/admin/financial/payout
const processPayout = async (req, res) => {
    const { designerId, amount, paymentMethod, note } = req.body;
    try {
        const payout = new Payout({
            designer: designerId,
            amount,
            paymentMethod,
            note,
            processedBy: req.user._id
        });
        await payout.save();
        res.status(201).json(payout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refund an order
// @route   POST /api/admin/orders/:id/refund
const refundOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isRefunded = true;
            order.refundedAt = Date.now();
            order.status = 'Refunded';
            await order.save();
            res.json({ message: "Order refunded successfully", order });
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sales and earnings for a specific designer
// @route   GET /api/users/sales
const getDesignerSales = async (req, res) => {
    try {
        const designerId = req.user._id;

        // 1. Get all paid orders containing this designer's products
        const orders = await Order.find({ isPaid: true, isRefunded: false })
            .populate({
                path: 'orderItems.product',
                select: 'title designer mockupImages'
            });

        const sales = [];
        let totalEarned = 0;

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product && item.product.designer && item.product.designer.toString() === designerId.toString()) {
                    const earned = (item.markup || 0) * item.qty;
                    totalEarned += earned;
                    sales.push({
                        id: `#${order._id.toString().substring(order._id.toString().length - 6).toUpperCase()}`,
                        item: item.product.title || item.name,
                        date: order.createdAt,
                        earned: `LKR ${earned}`,
                        status: order.status,
                        img: item.product.mockupImages?.[0] || item.image
                    });
                }
            });
        });

        // 2. Get total already paid to this designer
        const payouts = await Payout.find({ designer: designerId });
        const alreadyPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

        // 3. Calculate this month's earnings
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        let thisMonthEarned = 0;
        orders.filter(o => new Date(o.createdAt) >= startOfMonth).forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product && item.product.designer && item.product.designer.toString() === designerId.toString()) {
                    thisMonthEarned += (item.markup || 0) * item.qty;
                }
            });
        });

        res.json({
            summary: {
                totalEarned,
                alreadyPaid,
                balance: Math.max(0, totalEarned - alreadyPaid),
                totalOrders: sales.length,
                thisMonthEarned,
                pendingOrders: sales.filter(s => s.status === 'Processing' || s.status === 'Printing').length
            },
            sales: sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        });
    } catch (error) {
        console.error("getDesignerSales Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFinancialSummary,
    getDesignerPayouts,
    processPayout,
    refundOrder,
    getDesignerSales
};
