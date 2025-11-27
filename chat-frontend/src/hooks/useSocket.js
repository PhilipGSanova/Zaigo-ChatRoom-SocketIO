import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

export default function useSocket(token) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!token) return;

        const newSocket = io('https://zaigo-chatroom-socketio-frontend.onrender.com', {
            auth: { token },
            withCredentials: true,
        });

        newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
        newSocket.on('connect_error', (err) => console.error('Socket error:', err.message));

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            console.log('Socket disconnected');
        };
    }, [token]);

    return socket;
}
