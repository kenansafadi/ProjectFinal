import { useState } from "react";
import useChat from "../../hooks/useChat"; 
export default function ChatBox() {
    const { messages, sendMessage } = useChat(); 
    const [input, setInput] = useState("");

    
    const handleSendMessage = () => {
        if (input.trim()) {
            sendMessage(input); 
            setInput(""); 
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
