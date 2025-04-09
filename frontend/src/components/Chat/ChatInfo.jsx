import React from "react";

const ChatInfo = ({ chat }) => {
    return (
        <div className="chat-info">
            <h2>{chat.name}</h2>
            <p>{chat.description}</p>
        </div>
    );
};

export default ChatInfo;

