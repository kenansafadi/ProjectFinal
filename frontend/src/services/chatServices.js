// services/ChatService.js
import socket from "../utils/socket";
import { getToken } from "../utils/jwtHelper";
import API_BASE_URL from "../utils/api";

const ChatService = {
    // Connect to the chat room for a user (Real-time)
    connect: (onNewMessage) => {
        const token = getToken();
        socket.emit("register", token); // 🔐 Register the user with socket server

        socket.on("receiveMessage", (message) => {
            onNewMessage(message);
        });

        socket.on("messagesSeen", (userId) => {
            console.log(`Messages for user ${userId} have been marked as seen.`);
        });
    },

    // Send a new message to the chat room (Real-time)
    sendMessage: (chatId, messageData) => {
        const token = getToken();
        socket.emit("sendMessage", { chatId, ...messageData, token }); // Emit message to server
    },

    // Mark messages as seen (Real-time)
    markMessagesAsSeen: (userId) => {
        socket.emit("markMessagesAsSeen", userId); // Notify server to mark messages as seen
    },

    // Fetch chat messages for a specific user (Initial load / Historical Data)
    fetchChatMessages: async (userId) => {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/chat/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch chat messages");
        }

        return response.json(); // Return the chat history
    },

    // Disconnect from the socket server
    disconnect: () => {
        socket.disconnect();
    },
};

// Export ChatService as default
export default ChatService;

