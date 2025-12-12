import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatWindow.css";

export default function ChatWindow({ messages, socket, currentRoom, user, addMessage }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const imageInputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentRoom) return <div className="chat-window">Select a room to start chatting</div>;

  // ---------------- TEXT MESSAGE ----------------
  const sendMessage = () => {
    if (!text.trim()) return;

    const tempMessage = {
      _id: Date.now(),
      sender: { _id: user._id, fullName: user.fullName },
      text,
      attachments: [],
      createdAt: new Date(),
    };

    addMessage(tempMessage); // show instantly

    socket.emit("send_message", { roomId: currentRoom._id, text });

    setText("");
  };

  // ---------------- VOICE MESSAGE ----------------
  const toggleRecording = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const reader = new FileReader();

          reader.onloadend = () => {
            const base64Audio = reader.result;

            socket.emit("send_voice_message", {
              roomId: currentRoom._id,
              audio: base64Audio,
            });
          };

          reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Mic blocked:", err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  // ---------------- IMAGE MESSAGE ----------------
  console.log("imageInputRef current:", imageInputRef.current);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);

    const tempMessage = {
      _id: Date.now(),
      sender: { _id: user._id, fullName: user.fullName },
      text: null,
      attachments: [{ url: tempUrl, filename: file.name, mime: file.type }],
      createdAt: new Date(),
    };

    addMessage(tempMessage); // show instantly

    // Upload to backend
    console.log("Uploading image, user:", user);

    const formData = new FormData();
    formData.append("roomId", currentRoom._id);
    formData.append("senderId", user.id);
    formData.append("attachment", file);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/image-upload/image`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const serverMessage = await res.json();

      // Replace temp message with real message from server
      addMessage(serverMessage, tempMessage._id);

    } catch (err) {
      console.error("Image upload error:", err);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        {currentRoom.isPrivate
          ? currentRoom.members.find((m) => m._id !== user.id)?.fullName
          : currentRoom.name}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} currentUserId={user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>

        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={imageInputRef}
          onChange={handleImageChange}
        />
        <button onClick={() => imageInputRef.current?.click()}>📷</button>

        <button className="mic-btn" onClick={toggleRecording}>
          {recording ? "⏹️" : "🎤"}
        </button>
        {recording && <span style={{ color: "red" }}>Recording…</span>}
      </div>
    </div>
  );
}
