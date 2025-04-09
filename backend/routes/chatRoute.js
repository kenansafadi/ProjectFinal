const express = require("express");
const { sendMessage, getMessages, markMessagesAsSeen } = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, sendMessage); // Send message
router.get("/:userId", authMiddleware, getMessages); // Get messages between two users
router.put("/:userId/seen", authMiddleware, markMessagesAsSeen); // Mark messages as seen

module.exports = router;
