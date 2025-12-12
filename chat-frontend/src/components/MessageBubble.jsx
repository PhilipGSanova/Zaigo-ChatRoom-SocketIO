import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ msg, currentUserId }) {
  // Determine the sender
  const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
  const isSender = senderId === currentUserId;

  console.log("sender =", senderId, "currentUser =", currentUserId, "isSender =", isSender);

  return (
    <div className={`message-bubble ${isSender ? "sender" : "receiver"}`}>
      
      {/* Sender name */}
      {msg.sender?.fullName && <span className="username">{msg.sender.fullName}</span>}

      {/* Text message */}
      {msg.text && <span className="text">{msg.text}</span>}

      {/* Image attachments */}
      {msg.attachments &&
        msg.attachments.length > 0 &&
        msg.attachments.map((att) => {
          if (att.mime?.startsWith("image/")) {
            return (
              <img
                key={att._id || att.filename}
                className="message-image"
                src={att.url}
                alt={att.filename || "image"}
              />
            );
          } else if (att.mime?.startsWith("audio/")) {
            // Optional: handle audio as an attachment if not using separate audio field
            return <audio key={att._id || att.filename} controls src={att.url}></audio>;
          }
          return null;
        })}

      {/* Voice message (if msg.audio exists separately) */}
      {msg.audio && <audio controls src={msg.audio}></audio>}

      {/* Timestamp */}
      <span className="timestamp">
        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
      </span>
    </div>
  );
}