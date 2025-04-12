const express = require("express");
const { createNotification, markAsRead, getNotificationsForUser } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth"); // Import your custom auth middleware
const Notification = require('../model/Notification');

const router = express.Router();

router.get('/:id', async (req, res) => {
   try {
      const { id } = req.params;
      const notification = await Notification.findById(id);
      res.status(200).json(notification || []);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching notification' });
   }
});

router.get('/', async (req, res) => {
   try {
      const { userId } = req.query;
      const notifications = await Notification.find({ $and: [{ userId }, { read: false }] });
      res.status(200).json(notifications || []);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching notifications' });
   }
});

router.post('/mark-as-read', async (req, res) => {
   try {
      const { notificationId } = req.body;
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      res.status(200).json({ message: 'Notification marked as read' });
   } catch (error) {
      res.status(500).json({ message: 'Error marking notification as read' });
   }
});






module.exports = router;
