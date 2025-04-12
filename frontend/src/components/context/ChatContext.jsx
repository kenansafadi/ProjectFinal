// context/ChatContext.js
import { createContext, useEffect, useState } from "react";
import { getUserIdFromToken } from "../../utils/jwtHelper"; // Import your helper

import ChatService from "../../services/chatServices"; // Default import

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  // Error state

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const userId = getUserIdFromToken(); // ✅ Get it dynamically
                if (!userId) throw new Error("User not logged in.");

                const messagesData = await ChatService.fetchChatMessages(userId); // Use ChatService
                setMessages(messagesData);

                await ChatService.markMessagesAsSeen(userId); // Use ChatService
            } catch (error) {
                setError(error.message);  // Set the error message
                console.error("Failed to fetch messages:", error);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, []);

    const sendMessage = async (chatId, msg) => {
        if (msg.trim()) {
            try {
                const messageData = { msg };
                await ChatService.sendMessage(chatId, messageData); // Use ChatService
                setMessages((prev) => [...prev, { msg }]);
            } catch (error) {
                setError("Failed to send message");
                console.error("Failed to send message:", error);
            }
        }
    };

    return (
        <ChatContext.Provider value={{ messages, sendMessage, loading, error }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;
