const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

app.use(express.static('public'));


const users = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- 1. USER REGISTRATION (Client sends 'register' event) ---
    socket.on('register', (username) => {
        const userId = uuidv4();
        const finalUsername = username.trim() || `User-${socket.id.slice(0,5)}`;
        
        users.set(socket.id, { username: finalUsername, userId });
        console.log(`Registered ${socket.id} as ${finalUsername}`);

        // Client expects 'set_user_info' for ID/name sync (from history)
        // Client also expects 'registered' (from current client_chat.js)
        socket.emit('registered', { socketId: socket.id, userId });
        
        // Broadcast the initial join message using the standard 'chat_message' format
        const joinMsg = { 
            sender: 'System', 
            text: `${finalUsername} joined the chat.`, 
            timestamp: new Date().toLocaleTimeString(),
            type: 'system'
        };
        io.emit('chat_message', joinMsg);
        
        broadcastUsers();
    });

    // --- 2. BROADCAST MESSAGE ---
    socket.on('message', (text) => { 
        const sender = users.get(socket.id);
        if (!sender) return socket.emit('server_message', { text: "Please register first." });

        const messageData = { 
            sender: sender.username, 
            text: text, 
            timestamp: new Date().toLocaleTimeString(),
            type: 'broadcast' 
        };
        // Emit using the standard event name
        io.emit('chat_message', messageData);
        console.log(`Broadcast from ${sender.username}: ${text}`);
    });

    // --- 3. PRIVATE MESSAGE ---
    socket.on('private_message', ({ recipientId, text }) => {
        const sender = users.get(socket.id);
        if (!sender) return;

        const messageData = { 
            sender: sender.username, 
            text: text, 
            timestamp: new Date().toLocaleTimeString(),
            type: 'private' 
        };
        
        // Send to recipient
        io.to(recipientId).emit('chat_message', messageData);
        // Send back to sender for confirmation
        io.to(socket.id).emit('chat_message', messageData);
        
        console.log(`Private from ${sender.username} -> ${recipientId}: ${text}`);
    });

    // --- 4. JOIN ROOM ---
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        const sender = users.get(socket.id);
        if (!sender) return;

        // Notify room members using standard 'chat_message' format
        const joinMsg = { 
            sender: 'System', 
            text: `${sender.username} joined the room.`, 
            timestamp: new Date().toLocaleTimeString(),
            type: 'system',
            room: roomName
        };
        io.to(roomName).emit('chat_message', joinMsg);
        
        broadcastUsers();
        console.log(`${sender.username} joined room ${roomName}`);
    });
    
    // --- 5. ROOM MESSAGE ---
    socket.on('room_message', (data) => { // data = { room, text }
        const sender = users.get(socket.id);
        if (!sender) return;

        const messageData = { 
            sender: sender.username, 
            text: data.text, 
            timestamp: new Date().toLocaleTimeString(),
            type: 'room',
            room: data.room
        };
        
        // Emit to the specified room using the standard event name
        io.to(data.room).emit('chat_message', messageData);
        console.log(`Room message in ${data.room} from ${sender.username}: ${data.text}`);
    });


    // --- 6. LEAVE ROOM ---
    socket.on('leave_room', (roomName) => {
        socket.leave(roomName);
        const sender = users.get(socket.id);
        if (!sender) return;

        // Notify room members using standard 'chat_message' format
        const leaveMsg = { 
            sender: 'System', 
            text: `${sender.username} left the room.`, 
            timestamp: new Date().toLocaleTimeString(),
            type: 'system',
            room: roomName
        };
        io.to(roomName).emit('chat_message', leaveMsg);

        broadcastUsers();
        console.log(`${sender.username} left room ${roomName}`);
    });
    
    // --- 7. GET ROOM USERS ---
    socket.on("get_room_users", (roomName) => {
        const roomData = io.sockets.adapter.rooms.get(roomName);
        if(!roomData) return;

        const members = [...roomData].map(id => users.get(id));
        // Client expects 'room_users' event
        socket.emit("room_users", members.filter(Boolean)); 
    });


    // --- 8. DISCONNECT ---
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            console.log(`User disconnected: ${user.username} (${socket.id})`);
            users.delete(socket.id);
            
            // Broadcast system message using standard 'chat_message' format
            io.emit('chat_message', { 
                sender: 'System', 
                text: `${user.username} left the chat.`, 
                timestamp: new Date().toLocaleTimeString(),
                type: 'system'
            });
            
            broadcastUsers();
        }
    });

    // Utility: send updated users list
    function broadcastUsers() {
        const list = Array.from(users.entries()).map(([socketId, info]) => ({ socketId, username: info.username, userId: info.userId }));
        // Client expects 'users' event
        io.emit('users', list);
    }
});

// LISTEN OUTSIDE io.on
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));