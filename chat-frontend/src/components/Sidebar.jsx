import React, { useState, useEffect } from "react";
import "./Sidebar.css";

export default function Sidebar({ currentRoom, onRoomChange }) {
  const [rooms, setRooms] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/rooms`,
          {
            headers: {
              Authorization: `Bearer ${token}`,  // <-- FIXED
              "Content-Type": "application/json"
            },
            credentials: "include"
          }
        );

        const data = await res.json();

        // FIX: backend returns { rooms: [...] }
        if (Array.isArray(data.rooms)) {
          setRooms(data.rooms);
        } else if (Array.isArray(data)) {
          // fallback if backend returns an array
          setRooms(data);
        } else {
          console.error("Unexpected room format:", data);
          setRooms([]);
        }
      } catch (err) {
        console.error("Failed to load rooms:", err);
      }
    }

    if (token) loadRooms();
  }, [token]);

  const getFriend = (room) => {
    if (!room.isPrivate) return null;
    return room.members?.find((m) => m._id !== user._id);
  };

  return (
    <div className="sidebar">
      <h2>Chat Rooms</h2>
      <div className="chat-list">
        {rooms.filter((r) => !r.isPrivate).map((room) => (
          <div
            key={room._id} // <-- FIXED
            className={`chat-item ${
              currentRoom?._id === room._id ? "active" : ""
            }`}
            onClick={() => onRoomChange(room._id, room)}
          >
            {room.name}
          </div>
        ))}
      </div>

      <h2>Direct Messages</h2>
      <div className="chat-list">
        {rooms.filter((r) => r.isPrivate).map((room) => {
          const friend = getFriend(room);
          return (
            <div
              key={room._id}
              className={`chat-item ${
                currentRoom?._id === room._id ? "active" : ""
              }`}
              onClick={() => onRoomChange(room._id, room)}
            >
              {friend?.username || friend?.fullName || "Unknown"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
