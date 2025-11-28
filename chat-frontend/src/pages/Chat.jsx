import React, { useEffect, useState } from "react";
import { connectSocket } from "../socket";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import "./Chat.css";

export default function Chat() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("69292e93d4ac2dfa35e720db");

  async function loadMessages(roomId) {
    try {
      const res = await fetch(
        `https://zaigo-chatroom-socketio-backend.onrender.com/api/messages/${roomId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      return data.messages || [];
    } catch (err) {
      console.error("Failed to load messages:", err);
      return [];
    }
  }

  // Initialize socket
  useEffect(() => {
    if (!token) return;
    const s = connectSocket(token);
    setSocket(s);
    return () => s.disconnect();
  }, [token]);

  // Join room + load history + socket events
  useEffect(() => {
    if (!socket || !currentRoom) return;

    // Load old messages
    loadMessages(currentRoom).then((msgs) => {
      setMessages(msgs);
    });

    // Join room
    socket.emit("join_room", { roomId: currentRoom });

    // Listen for new messages
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_room", { roomId: currentRoom });
    };
  }, [socket, currentRoom]);

  const handleRoomChange = (roomId) => {
    if (!socket) return;
    socket.emit("leave_room", { roomId: currentRoom });
    setCurrentRoom(roomId);
  };

  return (
    <div className="chat-container">
      <Sidebar currentRoom={currentRoom} onRoomChange={handleRoomChange} />
      <ChatWindow messages={messages} socket={socket} currentRoom={currentRoom} user={user} />
    </div>
  );
}
