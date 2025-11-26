import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ msg, currentUserId }) {
  const isSender = msg.sender.id === currentUserId;

  return (
    <div className={`message-bubble ${isSender ? "sender" : "receiver"}`}>
      <span className="username">{msg.sender.username}: </span>
      <span className="text">{msg.text}</span>
      <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>
    </div>
  );
}
