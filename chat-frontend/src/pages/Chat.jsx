import React, { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../socket"; // import socket helpers
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import "./Chat.css";

export default function Chat() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("6926acd1c3a5bd33594fce1b");

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  // Handle socket events for messages and typing
  useEffect(() => {
    if (!socket) return;

    // Join current room
    socket.emit("join_room", { roomId: currentRoom });

    // Listen for new messages
    const handleNewMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("new_message", handleNewMessage);

    // Listen for typing status
    const handleTyping = (data) => {
      console.log(data.username, "is typing:", data.isTyping);
    };
    socket.on("typing_status", handleTyping);

    // Cleanup on room change or unmount
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing_status", handleTyping);
      socket.emit("leave_room", { roomId: currentRoom });
    };
  }, [socket, currentRoom]);

  const handleRoomChange = (roomId) => {
    if (!socket) return;

    socket.emit("leave_room", { roomId: currentRoom });
    setCurrentRoom(roomId);
    setMessages([]);
    socket.emit("join_room", { roomId });
  };

  return (
    <div className="chat-container">
      <Sidebar
        currentRoom={currentRoom}
        onRoomChange={handleRoomChange}
        className="sidebar"
      />
      <ChatWindow
        messages={messages}
        socket={socket}
        currentRoom={currentRoom}
        user={user}
        className="chat-window"
      />
    </div>
  );
}
