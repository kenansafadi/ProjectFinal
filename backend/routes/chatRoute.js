const express = require("express");
const { sendMessage, getMessages, markMessagesAsSeen } = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");
const { User } = require('../model/usersModel');
const Message = require('../model/MessageModel');

const router = express.Router();

router.get('/first-chat-user', authMiddleware, async (req, res) => {
   try {
      const user_id = req.query.user_id;

      const user = await User.findById(user_id, 'username email _id');

      if (!user) {
         return res.status(400).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
   } catch (error) {
      console.log('error', error);
      res.status(400).json({ message: 'Server Error' });
   }
});

router.get('/users', authMiddleware, async (req, res) => {
   try {
      const userId = req.user.id;

      // Find distinct user IDs from messages where current user is sender or receiver
      const messages = await Message.find({
         $or: [{ senderId: userId }, { receiverId: userId }],
      });

      // Extract the other user's ID from each message
      const userIds = new Set();
      messages.forEach((msg) => {
         if (msg.senderId.toString() !== userId) userIds.add(msg.senderId.toString());
         if (msg.receiverId.toString() !== userId) userIds.add(msg.receiverId.toString());
      });

      // Convert Set to array
      const chatUserIds = Array.from(userIds);

      // Fetch those users' data
      const users = await User.find({ _id: { $in: chatUserIds } }, 'username email _id');

      res.status(200).json(users || []);
   } catch (error) {
      console.error('error', error);
      res.status(500).json({ message: 'Server Error' });
   }
});

//       const messages = await Message.find({
//          $or: [
//             { senderId: user.id, receiverId: { $in: users.map((user) => user._id) } },
//             { receiverId: user.id, senderId: { $in: users.map((user) => user._id) } },
//          ],
//       });

//       console.log(messages);

//       // const usersWithMessages = users.map(user => {
//       //    const userMessages = messages.filter(message => message.senderId === user.id || message.receiverId === user.id);
//       //    return { ...user, messages: userMessages };
//       // });

//       res.status(200).json(usersWithMessages);
//    } catch (error) {
//       console.log('error', error);
//    }
// });

router.get('/messages', authMiddleware, async (req, res) => {
   try {
      const { senderId, receiverId } = req.query;

      const _senderId = senderId.toString();
      const _receiverId = receiverId.toString();
      const messages = await Message.find({
         $or: [
            { senderId: _senderId, receiverId: _receiverId },
            { senderId: _receiverId, receiverId: _senderId },
         ],
      });

      res.status(200).json(messages || []);
   } catch (error) {
      console.log('error', error);
      res.status(400).json({ message: 'Server Error' });
   }
});

module.exports = router;
