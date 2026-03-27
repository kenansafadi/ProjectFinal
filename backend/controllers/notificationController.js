const Notification = require("../model/Notification");

const getNotificationsForUser = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })  
            .sort({ createdAt: -1 })
            .limit(10); // להגביל ל-10 התראות אחרונות

        res.status(200).json({ data: notifications });
    } catch (err) {
        console.error("Error fetching notifications:", err.message);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// יצירת התראה חדשה
const createNotification = async (userId, message) => {
    try {
        const newNotification = new Notification({
            userId,
            message,
            read: false
        });
        await newNotification.save();
        console.log("Notification created:", newNotification);
    } catch (err) {
        console.error("Error creating notification:", err.message);
    }
};

// סימון התראה כנקראה
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: "Notification not found" });

        notification.read = true;
        await notification.save();

        res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createNotification, markAsRead, getNotificationsForUser };
