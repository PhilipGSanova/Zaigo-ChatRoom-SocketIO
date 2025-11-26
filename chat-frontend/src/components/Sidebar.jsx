import React from "react";
import "./Sidebar.css"; // <-- import the CSS here

export default function Sidebar({ currentRoom, onRoomChange }) {
  const rooms = ["general", "developers", "friends"];

  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <div className="chat-list">
        {rooms.map((room) => (
          <div
            key={room}
            className={`chat-item ${currentRoom === room ? "active" : ""}`}
            onClick={() => onRoomChange(room)}
          >
            {room.charAt(0).toUpperCase() + room.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
}
