import React from "react"
import { useRef, useEffect, useState } from "react"
import MessageBubble from "./MessageBubble"
import "./ChatWindow.css"

export default function ChatWindow({ messages, socket, currentRoom, user }) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (!text.trim()) return
    socket.emit("send_message", { roomId: currentRoom, text });
    setText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg, i) =>  (
          <MessageBubble 
            key={i} 
            msg={msg} 
            currentUserId={user?.id || user?._id}
            />
          ))}
      </div>

      <div className="chat-input-container">
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}