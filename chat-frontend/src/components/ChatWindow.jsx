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
  const token = localStorage.getItem("token");

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentRoom) {
    return <div className="chat-window">Select a room or friend to start chatting</div>;
  }

  // Send text message
  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("send_message", { roomId: currentRoom._id, text });
    setText("");
  };

  // Toggle voice recording
  const toggleRecording = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const reader = new FileReader();

          reader.onloadend = () => {
            const base64Audio = reader.result;

            // Emit to server
            socket.emit("send_voice_message", {
              roomId: currentRoom._id,
              audio: base64Audio,
            });

            // Optimistically add to chat immediately
            const tempMessage = {
              _id: Date.now(),
              sender: { _id: user._id, fullName: user.fullName },
              text: null,
              attachments: [
                { url: base64Audio, filename: "voice-message.webm", mime: "audio/webm" },
              ],
              createdAt: new Date(),
            };

            if (typeof addMessage === "function") {
              addMessage(tempMessage);
            }
          };
          reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Mic access denied:", err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  // Handle image upload
  // inside ChatWindow component
  const handleImageChange = async (e) => {
    console.log("Triggered!");
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("roomId", currentRoom._id);
    console.log("USER OBJECT BEFORE UPLOAD =", user);
    if (!user || (!user._id && !user.id)) {
      console.error("User not ready yet! Cannot send image.");
      return;
    }
    formData.append("senderId", user.id);
    formData.append("attachment", file);

    console.log("USER OBJECT =", user);


    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/image-upload/image`, {
        method: "POST",
        credentials: "include", // IMPORTANT
        headers: {
          Authorization: `Bearer ${token}`,   // ← ADD THIS
        },
        body: formData,         // do NOT set any headers
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Upload failed");
      }
      const message = await res.json();
      // addMessage should append to local UI state instantly
      if (typeof addMessage === "function") addMessage(message);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };


  return (
    <div className="chat-window">
      <div className="chat-header">
        {currentRoom.isPrivate
          ? currentRoom.members.find((m) => m._id !== user._id)?.fullName || "Direct Chat"
          : currentRoom.name}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} currentUserId={user?._id || user?.id} />
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

        {/* Hidden file input for images */}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={imageInputRef}
          onChange={handleImageChange}
        />
        <button onClick={() => imageInputRef.current?.click()}>📷</button>

        {/* Voice recording button */}
        <button className="mic-btn" onClick={toggleRecording}>
          {recording ? "⏹️" : "🎤"}
        </button>
        {recording && <span style={{ color: "red", marginLeft: "10px" }}>Recording…</span>}
      </div>
    </div>
  );
}
