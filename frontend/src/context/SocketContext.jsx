import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected' | 'error'
  const messageListenersRef = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
      return;
    }

    setConnectionStatus('connecting');

    // If VITE_BACKEND_URL is specified (e.g. http://localhost:3000), use that; otherwise use relative origin (Vite proxy)
    const socketUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;

    const newSocket = io(socketUrl, {
      path: '/socket.io',
      withCredentials: true,
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      setIsConnected(false);
      setConnectionStatus('error');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    newSocket.on('message-response', (data) => {
      // data: { content: string, chatId: string }
      messageListenersRef.current.forEach((listener) => {
        try {
          listener(data);
        } catch (err) {
          console.error('Error in message listener:', err);
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [isAuthenticated, token]);

  const sendMessage = useCallback(
    ({ chat, content }) => {
      if (!socket || !isConnected) {
        console.warn('Socket not connected, unable to send message');
        return false;
      }
      // Backend expects { chat: chatId, content: messageText }
      socket.emit('chat-message', {
        chat,
        content,
      });
      return true;
    },
    [socket, isConnected]
  );

  const subscribeToMessages = useCallback((callback) => {
    messageListenersRef.current.add(callback);
    return () => {
      messageListenersRef.current.delete(callback);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionStatus,
        sendMessage,
        subscribeToMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
