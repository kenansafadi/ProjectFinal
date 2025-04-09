const PORT = 3005;
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const { verifyToken } = require("./utils/jwtHelper")
const app = express();
const server = http.createServer(app); // ✅ http server for socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Socket.io logic for managing users and notifications
io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // Store user's socket ID to target them later
    socket.on("register", async (token) => {
        try {
            const decoded = verifyToken(token); // Use your own function
            socket.userId = decoded.id;
            socket.join(decoded.id);
            console.log(`✅ User ${decoded.id} joined their room`);
        } catch (err) {
            console.error("❌ Invalid token on register:", err.message);
        }
    });
    // Example for sending notifications to a specific user
    socket.on("sendNotification", ({ userId, message }) => {
        socket.to(userId).emit("receiveNotification", message); // Send to specific user
    });
    // 💬 Chat: sendMessage (Real-time only)
    socket.on("sendMessage", async (messageData) => {
        try {
            const { sender, receiver, text } = messageData;
            const message = new Message({ sender, receiver, text });
            await message.save();

            // Emit to both sender and receiver
            io.to(sender).emit("receiveMessage", message);
            io.to(receiver).emit("receiveMessage", message);
        } catch (err) {
            console.error("❌ Error sending message:", err.message);
        }
    });

    // ✅ Mark messages as seen (Real-time only)
    socket.on("markMessagesAsSeen", async (otherUserId) => {
        try {
            const userId = socket.userId; // You can attach this on register if needed
            await Message.updateMany(
                { receiver: userId, sender: otherUserId, seen: false },
                { seen: true }
            );
            io.to(otherUserId).emit("messagesSeen", userId); // Notify the sender
        } catch (err) {
            console.error("❌ Error marking messages as seen:", err.message);
        }
    });
    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/userRoute");
const postRouter = require("./routes/postRoute");
const chatRouter = require("./routes/chatRoute");
const authMiddleware = require("./middleware/auth");
const notificationRoutes = require("./routes/notificationRoutes");

app.use('/api/notifications', notificationRoutes);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/chat", chatRouter);
app.use("/api/users", authMiddleware, userRouter);


// Database connection and server start
async function connect() {
    try {
        await mongoose.connect(process.env.CONNECTION_ATLAS);
        console.log("✅ Connected to MongoDB");

        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🌐 Frontend allowed at: ${process.env.CLIENT_URL}`);
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
}

connect();
