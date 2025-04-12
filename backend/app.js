const PORT = 3005;
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
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
      // const decoded = verifyToken(token);
      // socket.userId = decoded.id;

      socket.join(token);

      return next();
   }

   return next(new Error(JSON.stringify({ message: 'Unauthorized' })));
});

io.on('connection', (socket) => {
   socket.on('SendMessage', async ({ senderId, receiverId, text, sender_name }) => {
      io.to(receiverId).emit('ReceiveMessage', {
         senderId,
         receiverId,
         text,
         isRead: false,
      });
      io.to(receiverId).emit('ReceiveNotification', {
         userId: receiverId,
         message: `${sender_name} sent you a message`,
         sender_name,
         read: false,
         text,
      });

      const message = new Message({ senderId, receiverId, text, isRead: false, sender_name });
      await message.save();
      const notification = new Notification({
         userId: receiverId,
         message: `${sender_name} sent you a message`,
         sender_name,
         read: false,
         text,
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
   })
);

app.use(express.json());

// Routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/userRoute');
const postRouter = require('./routes/postRoute');
const chatRouter = require('./routes/chatRoute');
const authMiddleware = require('./middleware/auth');
const notificationRoutes = require('./routes/notificationRoutes');

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

