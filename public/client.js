const socket = io();

// UI elements
const usernameInput = document.getElementById('usernameInput');
const btnRegister = document.getElementById('btnRegister');
const mySocketIdSpan = document.getElementById('mySocketId');
const usersList = document.getElementById('usersList');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const btnSend = document.getElementById('btnSend');
const targetSelect = document.getElementById('targetSelect');
const privateTarget = document.getElementById('privateTarget');
const roomInput = document.getElementById('roomInput');
const btnJoinRoom = document.getElementById('btnJoinRoom');
const btnLeaveRoom = document.getElementById('btnLeaveRoom');
const roomsList = document.getElementById('roomsList');
const roomTarget = document.getElementById('roomTarget');

let mySocketId = null;
let myUserId = null;
let users = [];
let joinedRooms = new Set();

//--------------------------------------------------------------
// REGISTER USER
//--------------------------------------------------------------
btnRegister.onclick = () => {
  const name = usernameInput.value.trim();
  socket.emit('register', name);
};

socket.on('registered', ({ socketId, userId }) => {
  mySocketId = socketId;
  myUserId = userId;
  mySocketIdSpan.textContent = socketId;
  appendSystem(`Registered as ${usernameInput.value || 'Anonymous'}`);
});

//--------------------------------------------------------------
// USERS LIST
//--------------------------------------------------------------
socket.on('users', (list) => {
  users = list;
  renderUsers();
  populatePrivateSelect();
});

function renderUsers() {
  usersList.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.username} — ${u.socketId.slice(0, 6)}`;
    li.dataset.socketId = u.socketId;

    li.onclick = () => {
      const prev = usersList.querySelector('.selected');
      if (prev) prev.classList.remove('selected');
      li.classList.add('selected');
      privateTarget.value = u.socketId;
    };

    usersList.appendChild(li);
  });
}

function populatePrivateSelect() {
  privateTarget.innerHTML = '';

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- choose user --';
  privateTarget.appendChild(defaultOpt);

  users.forEach(u => {
    if (u.socketId === mySocketId) return;
    const o = document.createElement('option');
    o.value = u.socketId;
    o.textContent = `${u.username} — ${u.socketId.slice(0, 6)}`;
    privateTarget.appendChild(o);
  });
}

//--------------------------------------------------------------
// MESSAGE EVENTS
//--------------------------------------------------------------
socket.on('message', (msg) => {
  appendMessage(msg.from, msg.text, msg.time);
});

socket.on('private_message', (msg) => {
  appendMessage(`${msg.from} (private)`, msg.text, msg.time, true);
});

socket.on('server_message', (m) => appendSystem(m.text));

socket.on('room_message', (m) => {
  const who = m.from || 'System';
  appendMessage(`${who} [${m.room}]`, m.text, m.time);
});

//--------------------------------------------------------------
// SEND MESSAGE
//--------------------------------------------------------------
btnSend.onclick = () => {
  let text = messageInput.value;

  // Force string conversion (FIX)
  text = String(text).trim();

  if (!text) return;

  const targetMode = targetSelect.value;

  if (targetMode === 'broadcast') {
    socket.emit('message', { text });
  } else if (targetMode === 'private') {
    const toSocketId = privateTarget.value;
    if (!toSocketId) return alert('Choose a user');
    socket.emit('private_message', { toSocketId, text });
  } else if (targetMode === 'room') {
    const room = roomTarget.value;
    if (!room) return alert('Choose a room');
    socket.emit('room_message', { room, text });
  }

  messageInput.value = '';
};


//--------------------------------------------------------------
// INPUT MODE SWITCH
//--------------------------------------------------------------
targetSelect.onchange = () => {
  const mode = targetSelect.value;
  privateTarget.style.display = mode === 'private' ? 'inline-block' : 'none';
  roomTarget.style.display = mode === 'room' ? 'inline-block' : 'none';
};

//--------------------------------------------------------------
// ROOMS
//--------------------------------------------------------------
btnJoinRoom.onclick = () => {
  const r = roomInput.value.trim();
  if (!r) return alert('Enter a room name');
  socket.emit('join_room', r);
  joinedRooms.add(r);
  renderRooms();
  populateRoomSelect();
};

btnLeaveRoom.onclick = () => {
  const r = roomInput.value.trim();
  if (!r) return alert('Enter room name');
  socket.emit('leave_room', r);
  joinedRooms.delete(r);
  renderRooms();
  populateRoomSelect();
};

function renderRooms() {
  roomsList.innerHTML = '';
  joinedRooms.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    roomsList.appendChild(li);
  });
}

function populateRoomSelect() {
  roomTarget.innerHTML = '';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- choose room --';
  roomTarget.appendChild(defaultOpt);

  joinedRooms.forEach(r => {
    const o = document.createElement('option');
    o.value = r;
    o.textContent = r;
    roomTarget.appendChild(o);
  });
}

//--------------------------------------------------------------
// ADD MESSAGES TO CHAT UI
//--------------------------------------------------------------
function appendMessage(from, text, ts, isPrivate = false) {
  const d = document.createElement('div');
  d.className = 'message';
  const t = new Date(ts).toLocaleTimeString();

  d.innerHTML = `
    <div class="meta">${from} <span style="color:#666">@ ${t}${isPrivate ? ' (private)' : ''}</span></div>
    <div>${escapeHtml(text)}</div>
  `;

  messagesDiv.appendChild(d);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendSystem(text) {
  const d = document.createElement('div');
  d.className = 'message';
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  d.style.background = isDark ? '#1e2633' : '#fff7ed';

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
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

//--------------------------------------------------------------
// CONNECTION LOGS
//--------------------------------------------------------------
socket.on('connect', () => appendSystem('Socket connected'));
socket.on('disconnect', () => appendSystem('Socket disconnected'));