const express = require("express");
const { createNotification, markAsRead, getNotificationsForUser } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth"); // Import your custom auth middleware

const router = express.Router();

// Create a notification (you already have this route)
router.post("/create", authMiddleware, createNotification);

// Mark a notification as read (you already have this route)
router.put("/:id/read", authMiddleware, markAsRead);

// Fetch notifications for the logged-in user
router.get("/", authMiddleware, getNotificationsForUser);  // Ensure that the user is authenticated

module.exports = router;
