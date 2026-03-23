import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useReduxAuth from "../../hooks/useReduxAuth"; // ✅ get token from Redux
import ChatService from "../../services/chatServices";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { token } = useReduxAuth(); // ✅ get token from Redux

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        // Connect to the chat service using token
        ChatService.connect(token, () => {
            setLoading(false);
        });

        ChatService.receiveMessage((message) => {
            setMessages((prev) => [...prev, message]);
        });

        ChatService.errorHandle((err) => {
            console.error("Socket connection error:", err);
            setError("Failed to connect to chat.");
            setLoading(false);
        });

        return () => {
            ChatService.disconnect();
        };
    }, [token]); // ✅ reconnect if token changes

    const sendMessage = (messageData) => {
        if (!messageData.receiverId) {
            toast.error("Please select a user to send your message to.");
            return;
        }
        try {
            ChatService.sendMessage(messageData, token); // ✅ pass token
            setMessages((prev) => [...prev, messageData]);
        } catch (err) {
            setError("Failed to send message");
            console.error("Failed to send message:", err);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, sendMessage, loading, error }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;