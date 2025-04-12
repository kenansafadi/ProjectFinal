// components/Chat/MessageInput.jsx
import React, { useState } from "react";
import useChat from "../../hooks/useChat";

const MessageInput = ({ chatId }) => {
    const [text, setText] = useState("");
    const { sendMessage } = useChat();

    const handleSend = () => {
        if (text.trim()) {
            sendMessage(chatId, text);
            setText("");
        }
    };

    return (
        <div className="message-input">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default MessageInput;
