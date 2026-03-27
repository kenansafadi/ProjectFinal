const express = require("express");
const authMiddleware = require("../middleware/auth");
const { User } = require('../model/usersModel');
const Message = require('../model/MessageModel');
const { fileUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/first-chat-user', authMiddleware, async (req, res) => {
   try {
      const user = await User.findById(req.query.user_id, 'username email _id profilePicture');
      if (!user) return res.status(400).json({ message: 'User not found' });
      res.status(200).json(user);
   } catch (error) {
      res.status(400).json({ message: 'Server Error' });
   }
});

router.get('/users', authMiddleware, async (req, res) => {
   try {
      const userId = req.user.id;
      const messages = await Message.find({
         $or: [{ senderId: userId }, { receiverId: userId }],
      });

      const userIds = new Set();
      messages.forEach((msg) => {
         if (msg.senderId.toString() !== userId) userIds.add(msg.senderId.toString());
         if (msg.receiverId.toString() !== userId) userIds.add(msg.receiverId.toString());
      });

      const currentUser = await User.findById(userId, 'followers following');
      if (currentUser) {
         currentUser.followers?.forEach(f => {
            if (f.isAccepted) userIds.add(f.userId.toString());
         });
         currentUser.following?.forEach(f => {
            if (f.isAccepted) userIds.add(f.userId.toString());
         });
      }

      const users = await User.find(
         { _id: { $in: [...userIds] } },
         'username email _id profilePicture'
      );
      res.status(200).json(users || []);
   } catch (error) {
      res.status(500).json({ message: 'Server Error' });
   }
});

router.get('/messages', authMiddleware, async (req, res) => {
   try {
      const { senderId, receiverId } = req.query;
      const messages = await Message.find({
         $or: [
            { senderId: senderId.toString(), receiverId: receiverId.toString() },
            { senderId: receiverId.toString(), receiverId: senderId.toString() },
         ],
      }).sort({ createdAt: 1 });
      res.status(200).json(messages || []);
   } catch (error) {
      res.status(400).json({ message: 'Server Error' });
   }
});

router.post('/upload', authMiddleware, fileUpload.single('file'), async (req, res) => {
   try {
      if (!req.file) return res.status(400).json({ message: 'No file provided' });

      const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = require('path').extname(req.file.originalname).toLowerCase();
      const isImage = imageExts.includes(ext);

      res.json({
         url: `/uploads/${req.file.filename}`,
         type: isImage ? 'image' : 'file',
         fileName: req.file.originalname,
         fileSize: req.file.size,
      });
   } catch (error) {
      res.status(500).json({ message: 'Failed to upload file' });
   }
});

router.post('/forward', authMiddleware, async (req, res) => {
   try {
      const { messageId, targetUserId } = req.body;
      const original = await Message.findById(messageId);
      if (!original) return res.status(404).json({ message: 'Message not found' });

      const forwarded = new Message({
         senderId: req.user.id,
         receiverId: targetUserId,
         text: original.text,
         type: original.type,
         image: original.image,
         fileName: original.fileName,
         fileSize: original.fileSize,
         location: original.location,
         forwarded: true,
         originalSenderName: original.sender_name,
         isRead: false,
         sender_name: req.user.username || 'Unknown',
      });
      await forwarded.save();
      res.status(201).json(forwarded);
   } catch (error) {
      res.status(500).json({ message: 'Failed to forward message' });
   }
});

router.delete('/messages/:id', authMiddleware, async (req, res) => {
   try {
      const message = await Message.findById(req.params.id);
      if (!message) return res.status(404).json({ message: 'Message not found' });
      if (String(message.senderId) !== req.user.id) {
         return res.status(403).json({ message: 'Can only delete your own messages' });
      }
      await Message.findByIdAndDelete(req.params.id);
      res.json({ message: 'Message deleted' });
   } catch (error) {
      res.status(500).json({ message: 'Failed to delete message' });
   }
});

module.exports = router;
