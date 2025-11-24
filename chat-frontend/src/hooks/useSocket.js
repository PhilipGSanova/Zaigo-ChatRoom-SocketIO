import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

export default function useSocket(token) {
    const [socket, setSocket ] = useState(null);

    useEffect(() => {
        if (!token) return;

        const newSocket = io('http://localhost:5000', {
            auth: { token: token },
        })

        setSocket(newSocket);

        return () => newSocket.disconnect()
    }, [token])

    return socket
}   