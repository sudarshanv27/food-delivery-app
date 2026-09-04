// web-app/src/hooks/useSocket.js

import { useEffect, useState } from 'react';

import io from 'socket.io-client';

const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL ||
    'http://localhost:5000';

export const useSocket = () => {
    const [socket, setSocket] =
        useState(null);

    useEffect(() => {
        // ================= CREATE SOCKET =================
        const socketInstance = io(
            SOCKET_URL,
            {
                transports: ['websocket'],
                autoConnect: true,
            }
        );

        // ================= CONNECTION EVENTS =================
        socketInstance.on(
            'connect',
            () => {
                console.log(
                    '✅ Socket connected:',
                    socketInstance.id
                );
            }
        );

        socketInstance.on(
            'disconnect',
            () => {
                console.log(
                    '❌ Socket disconnected'
                );
            }
        );

        socketInstance.on(
            'connect_error',
            (error) => {
                console.error(
                    '⚠️ Socket connection error:',
                    error.message
                );
            }
        );

        setSocket(socketInstance);

        // ================= CLEANUP =================
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return socket;
};

export default useSocket;