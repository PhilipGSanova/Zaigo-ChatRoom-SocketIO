import React, { useEffect, useState } from "react";
import { connectSocket } from "../socket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "./Chat.css";

export default function Chat() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  // ------------------- INIT SOCKET -------------------
  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);

    return () => s.disconnect();
  }, [token]);

  // ------------------- LOAD + LISTEN -------------------
  useEffect(() => {
    if (!socket || !currentRoom) return;

    // Load old messages
    const loadMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/${currentRoom._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed fetching messages:", err);
        setMessages([]);
      }
    };

    loadMessages();

    // JOIN room
    socket.emit("join_room", { roomId: currentRoom._id });

    // ------------------- SOCKET LISTENERS -------------------
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if temp message already exists
        if (prev.some((m) => m._id.toString() === msg._id.toString())) return prev;
        return [...prev, msg];
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("new_voice_message", handleNewMessage);
    socket.on("new_image_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("new_voice_message", handleNewMessage);
      socket.off("new_image_message", handleNewMessage);

      socket.emit("leave_room", { roomId: currentRoom._id });
    };
  }, [socket, currentRoom, token]);

  // ------------------- ADD MESSAGE TO UI -------------------
  const addMessage = (newMessage, replaceTempId = null) => {
    setMessages((prev) => {
      if (replaceTempId) {
        // Replace temporary message with server message
        return prev.map((m) => (m._id === replaceTempId ? newMessage : m));
      }
      // Prevent duplicates (if server already sent the message via socket)
      if (prev.some((m) => m._id.toString() === newMessage._id.toString())) return prev;
      return [...prev, newMessage];
    });
  };

  // ------------------- ROOM SWITCH -------------------
  const handleRoomChange = (roomId, roomObj) => {
    if (!roomObj) return;
    setCurrentRoom(roomObj);
    setMessages([]); // reset, will reload
  };

  return (
    <div className="chat-container">
      <Sidebar currentRoom={currentRoom} onRoomChange={handleRoomChange} />

      <ChatWindow
        messages={messages}
        socket={socket}
        currentRoom={currentRoom}
        user={user}
        addMessage={addMessage}
      />
    </div>
  );
}
