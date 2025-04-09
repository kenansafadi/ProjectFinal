// pages/Messages.jsx
import React from "react";
import ChatBox from "../components/Chat/ChatBox";
import MessageInput from "../components/Chat/MessageInput";
import ChatInfo from "../components/Chat/ChatInfo";
import useChat from "../components/hooks/useChat";
import "../Styles/messages.scss";

export default function Messages() {
    const { messages, loading, error } = useChat();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const currentChat = messages.length > 0 ? messages[0] : null;

    if (!currentChat) {
        return <div>No chat available</div>;
    }

    return (
        <div className="messages-page">
            <ChatInfo chat={currentChat} />
            <ChatBox />
            <MessageInput chatId={currentChat.id} />
        </div>
    );
}
