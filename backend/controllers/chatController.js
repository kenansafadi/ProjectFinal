const Message = require("../model/MessageModel");

// SEND MESSAGE
const sendMessage = async (req, res) => {
    try {
        const { receiver, text } = req.body;

        // Ensure receiver and text are provided
        if (!receiver || !text) {
            return res.status(400).json({ message: "Receiver and text are required" });
        }

        // Create new message
        const message = new Message({
            sender: req.user.id,  // The user sending the message
            receiver,             // The user receiving the message
            text,                 // The content of the message
        });

        // Save the message to the database
        await message.save();
        res.status(201).json(message);  // Return the newly created message
    } catch (error) {
        res.status(500).json({ message: error.message });  // Catch and return any errors
    }
};

// GET MESSAGES BETWEEN TWO USERS
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;  // Get the other user's ID from the request parameters
        const senderId = req.user.id;  // Get the current user's ID from the request (authenticated user)

        // Find all messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: userId },  // Messages where the current user is the sender
                { sender: userId, receiver: senderId },  // Messages where the current user is the receiver
            ]
        }).sort({ createdAt: 1 });  // Sort messages by creation time in ascending order

        res.status(200).json(messages);  // Return the messages
    } catch (error) {
        res.status(500).json({ message: error.message });  // Catch and return any errors
    }
};

// MARK MESSAGES AS SEEN
const markMessagesAsSeen = async (req, res) => {
    try {
        const { userId } = req.params;  // The ID of the user whose messages to mark as seen

        // Update all messages from the specified sender to the current user as "seen"
        await Message.updateMany(
            { receiver: req.user.id, sender: userId, seen: false },
            { seen: true }
        );

        res.status(200).json({ message: "Messages marked as seen" });  // Respond with success message
    } catch (error) {
        res.status(500).json({ message: error.message });  // Catch and return any errors
    }
};

module.exports = { sendMessage, getMessages, markMessagesAsSeen };
