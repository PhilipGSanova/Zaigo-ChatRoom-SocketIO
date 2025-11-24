const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'changeme';

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const payload = jwt.verify(token, jwtSecret);
      socket.user = payload; // { id, username }
      return next();
    } catch (err) {
      console.error('Socket auth error', err.message);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New socket connected', socket.user.username);

    // join personal room for private messages & notifications
    socket.join(socket.user.id);

    socket.on('join_room', async ({ roomId }) => {
      socket.join(roomId);
      // optionally mark user online in room
    });

    socket.on('leave_room', ({ roomId }) => {
      if (!roomId) return;

      socket.leave(roomId);

      socket.to(roomId).emit('user_left', {
        userId: socket.user.id,
        username: socket.user.username,
        roomId
      });

      console.log(`${socket.user.username} left room ${roomId}`);
    });

    socket.on('send_message', async ({ roomId, text }) => {
        if (!roomId || !text) return;

        const message = await Message.create({
          room: roomId,
          sender: socket.user.id,
          text
        });

        io.to(roomId).emit('new_message', {
            _id: message._id,
            text,
            roomId,
            sender: {
                id: socket.user.id,
                username: socket.user.username
            },
            createdAt: message.createdAt
        });
    });
      
    socket.on('typing', ({ roomId, isTyping }) => {
        socket.to(roomId).emit('typing_status', {
            roomId,
            userId: socket.user.id,
            username: socket.user.username,
            isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.user.username);
    });
  });
}

module.exports = { initSocket };