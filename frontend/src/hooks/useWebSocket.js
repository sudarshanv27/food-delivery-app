import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for WebSocket connections
 * @param {string} url - WebSocket URL
 * @param {Object} options - WebSocket options
 * @returns {Object} WebSocket state and methods
 */
const useWebSocket = (url, options = {}) => {
    const {
        onOpen,
        onClose,
        onError,
        onMessage,
        reconnectAttempts = 5,
        reconnectInterval = 3000,
        autoConnect = true
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    const [reconnectCount, setReconnectCount] = useState(0);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
                setReconnectCount(0);
                onOpen?.();
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected', event);
                setIsConnected(false);
                onClose?.(event);

                // Attempt to reconnect
                if (reconnectCount < reconnectAttempts) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectCount(prev => prev + 1);
                        connect();
                    }, reconnectInterval);
                }
            };

            wsRef.current.onerror = (event) => {
                console.error('WebSocket error', event);
                setError(event);
                onError?.(event);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                    onMessage?.(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    setLastMessage(event.data);
                    onMessage?.(event.data);
                }
            };
        } catch (err) {
            console.error('WebSocket connection error:', err);
            setError(err);
        }
    }, [url, reconnectCount, reconnectAttempts, reconnectInterval, onOpen, onClose, onError, onMessage]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        wsRef.current = null;
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            wsRef.current.send(message);
            return true;
        }
        console.warn('WebSocket is not connected');
        return false;
    }, []);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        error,
        sendMessage,
        connect,
        disconnect,
        reconnectCount
    };
};

export default useWebSocket;