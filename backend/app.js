const PORT = 3005;
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const { verifyToken } = require('./utils');
const Message = require('./model/MessageModel');
const Notification = require('./model/Notification');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: process.env.FRONTEND_API_URL,
      methods: ['GET', 'POST'],
      credentials: true,
   },
});

io.use((socket, next) => {
   const token = socket.handshake.auth.token;

   if (token) {
      try {
         const decoded = verifyToken(token);
         socket.userId = decoded.id;
         socket.join(decoded.id);
         return next();
      } catch (error) {
         return next(new Error(JSON.stringify({ message: 'Unauthorized' })));
      }
   }

   return next(new Error(JSON.stringify({ message: 'Unauthorized' })));
});

io.on('connection', (socket) => {
   socket.on('register', (userId) => {
      if (userId) socket.join(userId);
   });

   socket.on('SendMessage', async (msgData) => {
      const { senderId, receiverId, text, sender_name, image, type, fileName, fileSize, location, forwarded, originalSenderName, replyTo, postLink } = msgData;
      if (!senderId || !receiverId) return;

      const msgPayload = { senderId, receiverId, text, image, type, fileName, fileSize, location, forwarded, originalSenderName, replyTo, postLink, isRead: false };

      io.to(receiverId).emit('ReceiveMessage', msgPayload);
      socket.to(senderId).emit('ReceiveMessage', msgPayload);

      const previewText = type === 'image' ? '📷 Image'
         : type === 'file' ? `📄 ${fileName || 'File'}`
         : type === 'location' ? '📍 Location'
         : type === 'post_link' ? `🔗 ${postLink?.title || 'Post'}`
         : text;

      io.to(receiverId).emit('ReceiveNotification', {
         userId: receiverId,
         message: `${sender_name} sent you a message`,
         sender_name,
         read: false,
         text: previewText,
         senderId,
         type: 'message',
      });

      const message = new Message({ ...msgPayload, sender_name });
      await message.save();
      const notification = new Notification({
         userId: receiverId,
         message: `${sender_name} sent you a message`,
         sender_name,
         read: false,
         text: previewText,
         senderId,
         type: 'message',
      });
      await notification.save();
   });

   socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
   });
});

// Middlewares
app.use(morgan('dev'));
app.use(
   cors({
      origin: process.env.FRONTEND_API_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      optionsSuccessStatus: 204,
      credentials: true,
   })
);

app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/userRoute');
const postRouter = require('./routes/postRoute');
const chatRouter = require('./routes/chatRoute');
const authMiddleware = require('./middleware/auth');
const notificationRoutes = require('./routes/notificationRoutes');
const { User } = require('./model/usersModel');

// Public user lookup — no auth required
app.get('/api/users/public/:id', async (req, res) => {
   try {
      const user = await User.findById(req.params.id, '_id username email profilePicture bio followers following');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
   } catch (error) {
      res.status(400).json({ message: 'User not found' });
   }
});

app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/chat', chatRouter);
app.use('/api/users', authMiddleware, userRouter);

// Database connection and server start
async function connect() {
   try {
      await mongoose.connect(process.env.CONNECTION_ATLAS);
      console.log('✅ Connected to MongoDB');

      server.listen(PORT, () => {
         console.log(`🚀 Server running on http://localhost:${PORT}`);
         console.log(`🌐 Frontend allowed at: ${process.env.CLIENT_URL}`);
      });
   } catch (error) {
      console.error('❌ Database connection failed:', error.message);
   }
}

connect();

