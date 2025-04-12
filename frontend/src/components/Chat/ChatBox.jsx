import { useState } from "react";
import useChat from "../../hooks/useChat"; // Import the custom hook
export default function ChatBox() {
    const { messages, sendMessage } = useChat(); // Use the hook to get messages and sendMessage
    const [input, setInput] = useState("");

    // Send message when "Send" button is clicked
    const handleSendMessage = () => {
        if (input.trim()) {
            sendMessage(input); // Use the sendMessage from context
            setInput(""); // Clear the input field
        }
    };


    return (
        <div className="chat-box">
            <div className="messages">
                {messages.map((msg, i) => (
                    <div key={i} className="message">{msg}</div>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
}
