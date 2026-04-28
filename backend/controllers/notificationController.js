const Notification = require('../models/notificationModel');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification && notification.user.toString() === req.user._id.toString()) {
            notification.isRead = true;
            await notification.save();
            res.json({ message: "Notification marked as read" });
        } else {
            res.status(404).json({ message: "Notification not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to update notification" });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notifications" });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
