const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Keep a map of socketId -> { username, userId }
const users = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('register', (username) => {
    const userId = uuidv4();
    users.set(socket.id, { username: username || `User-${socket.id.slice(0,5)}`, userId });
    console.log(`Registered ${socket.id} as ${username}`);

    socket.emit('registered', { socketId: socket.id, userId });
    broadcastUsers();
    io.emit('server_message', { text: `${users.get(socket.id).username} joined the chat.`, time: Date.now() });
  });

  socket.on('message', (payload) => {
    const sender = users.get(socket.id) || { username: 'Unknown' };
    const msg = { from: sender.username, fromSocketId: socket.id, text: payload.text, time: Date.now() };
    io.emit('message', msg);
    console.log(`Broadcast from ${sender.username}: ${payload.text}`);
  });

  socket.on('private_message', ({ toSocketId, text }) => {
    const sender = users.get(socket.id) || { username: 'Unknown' };
    const msg = { from: sender.username, fromSocketId: socket.id, toSocketId, text, time: Date.now() };
    io.to(toSocketId).emit('private_message', msg);
    socket.emit('private_message', msg);
    console.log(`Private from ${sender.username} -> ${toSocketId}: ${text}`);
  });

  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    const sender = users.get(socket.id) || { username: 'Unknown' };
    io.to(roomName).emit('room_message', { room: roomName, text: `${sender.username} joined the room.`, time: Date.now() });
    broadcastUsers();
    console.log(`${sender.username} joined room ${roomName}`);
  });

  socket.on('leave_room', (roomName) => {
    socket.leave(roomName);
    const sender = users.get(socket.id) || { username: 'Unknown' };
    io.to(roomName).emit('room_message', { room: roomName, text: `${sender.username} left the room.`, time: Date.now() });
    broadcastUsers();
    console.log(`${sender.username} left room ${roomName}`);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`User disconnected: ${user.username} (${socket.id})`);
      users.delete(socket.id);
      io.emit('server_message', { text: `${user.username} left the chat.`, time: Date.now() });
      broadcastUsers();
    }
  });

  // Utility: send updated users list
  function broadcastUsers() {
    const list = Array.from(users.entries()).map(([socketId, info]) => ({ socketId, username: info.username, userId: info.userId }));
    io.emit('users', list);
  }
});

// ✅ LISTEN OUTSIDE io.on
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
