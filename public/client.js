const socket = io();

// UI elements
const usernameInput = document.getElementById("usernameInput");
const btnRegister = document.getElementById("btnRegister");
const mySocketIdSpan = document.getElementById("mySocketId");
const usersList = document.getElementById("usersList");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const btnSend = document.getElementById("btnSend");
const targetSelect = document.getElementById("targetSelect");
const privateTarget = document.getElementById("privateTarget");
const roomInput = document.getElementById("roomInput");
const btnJoinRoom = document.getElementById("btnJoinRoom");
const btnLeaveRoom = document.getElementById("btnLeaveRoom");
const roomsList = document.getElementById("roomsList");
const roomTarget = document.getElementById("roomTarget");

let mySocketId = null;
let myUserId = null;
let users = [];
let joinedRooms = new Set();
let roomChats = {}; // { roomName: [ {from,text,time} ] }
let activeRoom = null; // Tracks the room or null for global/private view
let myUsername = null; // Stores the final username

//--------------------------------------------------------------
// USER INFO AND INITIAL SETUP (Adapted for automatic server naming)
//--------------------------------------------------------------
// When the server sends initial info (auto-assigned name/ID)
socket.on("set_user_info", ({ id, name }) => {
  mySocketId = id;
  myUsername = name; // Server's auto-assigned name
  mySocketIdSpan.textContent = id;
  appendSystem(`Connected with ID: ${id.slice(0, 6)}...`);
  // Note: We don't use the 'registered' event from the old flow.
});

// Since the server auto-assigns the name, we use this button
// only to update the display and signal the user is ready.
btnRegister.onclick = () => {
  const name = usernameInput.value.trim();
  if (name && myUsername) {
    // In a real app, you'd send an 'update_username' event.
    // For this demo, we just update the local display.
    myUsername = name;
    appendSystem(`Display name set to: ${name}`);
  }
};

//--------------------------------------------------------------
// USERS LIST (GLOBAL)
//--------------------------------------------------------------
socket.on("users", (list) => {
  users = list;
  renderUsers();
  populatePrivateSelect();
});

function renderUsers() {
  usersList.innerHTML = "";
  users.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = `${u.username} — ${u.socketId.slice(0, 6)}`;
    li.dataset.socketId = u.socketId;

    li.onclick = () => {
      // Clear room selection
      activeRoom = null;
      document.getElementById("chatHeader").textContent =
        `DM with: ${u.username}`;
      messagesDiv.innerHTML = ""; // Clear main area

      // Update visual selection
      const prev = usersList.querySelector(".selected");
      if (prev) prev.classList.remove("selected");
      li.classList.add("selected");

      // Update compose targets
      privateTarget.value = u.socketId;
      targetSelect.value = "private";
      targetSelect.onchange(); // Trigger display update
    };

    usersList.appendChild(li);
  });
}

function populatePrivateSelect() {
  privateTarget.innerHTML = "";

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "-- choose user --";
  privateTarget.appendChild(defaultOpt);

  users.forEach((u) => {
    if (u.socketId === mySocketId) return;

    const o = document.createElement("option");
    o.value = u.socketId;
    o.textContent = `${u.username} — ${u.socketId.slice(0, 6)}`;
    privateTarget.appendChild(o);
  });
}

//--------------------------------------------------------------
// MESSAGE EVENTS
//--------------------------------------------------------------
// NOTE: Server now sends structured messages via 'chat_message'
socket.on("chat_message", (msg) => {
  // Check if the message is a room message or a global/private message
  if (msg.type === "room") {
    // ROOM MESSAGE ARRIVAL (handled below)

    // 1. Store history (m.room, m.from, m.text, m.time)
    if (!roomChats[msg.room]) roomChats[msg.room] = [];

    roomChats[msg.room].push({
      from: msg.sender || "System",
      text: msg.text,
      time: msg.timestamp,
    });

    // 2. ONLY display if the room is active
    if (activeRoom === msg.room) {
      appendRoomMessage(
        msg.room,
        msg.sender || "System",
        msg.text,
        msg.timestamp,
      );
    }
  } else if (msg.type === "private") {
    // PRIVATE MESSAGE ARRIVAL
    if (!activeRoom) {
      appendMessage(msg.sender, msg.text, msg.timestamp, true);
    }
  } else if (msg.type === "broadcast") {
    // BROADCAST MESSAGE ARRIVAL
    if (!activeRoom) {
      appendMessage(msg.sender, msg.text, msg.timestamp);
    }
  } else if (msg.type === "system") {
    appendSystem(msg.text);
  }
});

// The old 'message', 'private_message', and 'room_message' listeners are effectively
// replaced by the single 'chat_message' listener above for consistency with the server structure.

// room user updates
socket.on("room_users", (list) => {
  // If activeRoom is set, this replaces the global user list in the sidebar.
  usersList.innerHTML = "";
  list.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = `${u.username} — ${u.socketId.slice(0, 5)}`;
    usersList.appendChild(li);
  });
});

//--------------------------------------------------------------
// SEND MESSAGE
//--------------------------------------------------------------
btnSend.onclick = () => {
  const text = messageInput.value.trim();
  if (!text || !mySocketId) return;

  const targetMode = targetSelect.value;

  if (targetMode === "broadcast") {
    if (activeRoom) return alert("Leave the room chat to send a broadcast.");
    socket.emit("message", text); // <-- CORRECTED: Sends raw string text
  } else if (targetMode === "private") {
    if (activeRoom)
      return alert("Leave the room chat to send a private message.");
    const recipientId = privateTarget.value;
    if (!recipientId) return alert("Choose a user");
    // NOTE: Server expects 'recipientId' and 'text' object
    socket.emit("private_message", { recipientId, text });
  } else if (targetMode === "room") {
    const room = roomTarget.value;
    if (!room || room !== activeRoom)
      return alert(`Must be in room "${room}" to send a message to it.`);
    // NOTE: Server expects 'room' and 'text' object
    socket.emit("room_message", { room, text });
  }

  messageInput.value = "";
};

//--------------------------------------------------------------
// SWITCH INPUT MODE
//--------------------------------------------------------------
targetSelect.onchange = () => {
  const mode = targetSelect.value;
  privateTarget.style.display = mode === "private" ? "inline-block" : "none";
  roomTarget.style.display = mode === "room" ? "inline-block" : "none";

  // Clear any active chat room if mode switches away from 'room'
  if (mode !== "room") {
    activeRoom = null;
    messagesDiv.innerHTML = "";
    document.getElementById("chatHeader").textContent = "Chat";
    renderUsers();
    renderRooms();
  }
};

//--------------------------------------------------------------
// ROOMS
//--------------------------------------------------------------
btnJoinRoom.onclick = () => {
  const r = roomInput.value.trim();
  if (!r) return alert("Enter a room name");
  socket.emit("join_room", r);

  joinedRooms.add(r);
  if (!roomChats[r]) roomChats[r] = [];

  renderRooms();
  populateRoomSelect();
  openRoomChat(r);
};

btnLeaveRoom.onclick = () => {
  const r = roomInput.value.trim();
  if (!r) return alert("Enter room name");
  socket.emit("leave_room", r);

  joinedRooms.delete(r);
  if (activeRoom === r) {
    messagesDiv.innerHTML = "";
    activeRoom = null;
    document.getElementById("chatHeader").textContent = "Chat";
    renderUsers();
  }

  renderRooms();
  populateRoomSelect();
};

// sidebar rooms
function renderRooms() {
  roomsList.innerHTML = "";
  joinedRooms.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    li.dataset.roomName = r;

    li.onclick = () => openRoomChat(r);

    // Set selection state
    if (r === activeRoom) {
      li.classList.add("selected");
    }

    roomsList.appendChild(li);
  });
}

function openRoomChat(room) {
  // 1. Set global state and UI header
  activeRoom = room;
  messagesDiv.innerHTML = "";
  document.getElementById("chatHeader").textContent = `Room: ${room}`;

  // 2. Load room history and use the dedicated room rendering function
  if (roomChats[room]) {
    roomChats[room].forEach((m) => {
      appendRoomMessage(room, m.from, m.text, m.time);
    });
  }

  // 3. Update sidebar selection visuals for rooms and users
  const prevUser = usersList.querySelector(".selected");
  if (prevUser) prevUser.classList.remove("selected");

  renderRooms();

  // 4. Set compose mode to room
  targetSelect.value = "room";
  targetSelect.onchange();

  socket.emit("get_room_users", room);
}

function populateRoomSelect() {
  roomTarget.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "-- choose room --";
  roomTarget.appendChild(defaultOpt);

  joinedRooms.forEach((r) => {
    const o = document.createElement("option");
    o.value = r;
    o.textContent = r;
    roomTarget.appendChild(o);
  });
}

//--------------------------------------------------------------
// MESSAGE UI
//--------------------------------------------------------------
function appendMessage(from, text, ts, isPrivate = false) {
  // This function is for Global and Private messages ONLY
  const d = document.createElement("div");
  d.className = `message ${isPrivate ? "private" : ""}`;
  const t = new Date(ts).toLocaleTimeString();

  d.innerHTML = `
      <div class="meta">${from} <span style="color:#666">@ ${t}${isPrivate ? " (private)" : ""}</span></div>
      <div>${escapeHtml(text)}</div>
    `;

  messagesDiv.appendChild(d);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendRoomMessage(room, from, text, ts) {
  // This function is for Room messages ONLY
  const d = document.createElement("div");
  d.className = "message room";
  const t = new Date(ts).toLocaleTimeString();

  d.innerHTML = `
    <div class="meta">${from} <span style="color:#666">@ ${t} (Room: ${room})</span></div>
    <div>${escapeHtml(text)}</div>
  `;

  messagesDiv.appendChild(d);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendSystem(text) {
  const d = document.createElement("div");
  d.className = "message";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  d.style.background = isDark ? "#1e2633" : "#fff7ed";

  d.innerHTML = `
    <div class="meta">System</div>
    <div>${escapeHtml(text)}</div>
  `;

  messagesDiv.appendChild(d);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

//--------------------------------------------------------------
// HTML ESCAPE
//--------------------------------------------------------------
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

//--------------------------------------------------------------
// CONNECTION LOGS
//--------------------------------------------------------------
socket.on("connect", () => appendSystem("Socket connected"));
socket.on("disconnect", () => appendSystem("Socket disconnected"));
