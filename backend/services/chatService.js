const Message = require("../model/MessageModel");

// Send a new message
const createMessage = async (sender, receiver, text) => {
    if (!receiver || !text) throw new Error("Receiver and text are required");

    const message = new Message({ sender, receiver, text });
    return await message.save();
};

// Fetch messages between two users
const getUserMessages = async (user1, user2) => {
    return await Message.find({
        $or: [
            { sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 }
        ]
    }).sort({ createdAt: 1 });
};

// Mark all messages as seen
const markAsSeen = async (receiver, sender) => {
    return await Message.updateMany(
        { receiver, sender, seen: false },
        { seen: true }
    );
};

module.exports = { createMessage, getUserMessages, markAsSeen };
