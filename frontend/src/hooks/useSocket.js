import { useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import useAuth from './useReduxAuth';
import { isTokenExpired } from '../utils/jwtHelper';

const useSocket = (callback) => {
  const socket = useRef(null);
  const { token } = useAuth(); // get token from Redux

  useEffect(() => {
    // Don't connect if no token or token expired
    if (!token || isTokenExpired(token)) return;

    // Initialize socket
    socket.current = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      auth: { token }, // send JWT for server-side auth
    });

    // Connected successfully
    socket.current.on('connect', () => {
      console.log('Connected to socket server:', socket.current.id);
      if (callback) callback();
    });

    // Disconnected
    socket.current.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
    });

    // Connection errors
    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message || error);
    });

    // Cleanup on unmount
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [token]);

  const errorHandle = (handler) => {
    socket.current?.on('connect_error', handler);
  };

  const disconnect = () => {
    socket.current?.disconnect();
  };

  const sendMessage = (channel, messageData) => {
    socket.current?.emit(channel, messageData);
  };

  const receiveMessage = (channel, handler) => {
    socket.current?.on(channel, handler);
  };

  return { socket, errorHandle, disconnect, sendMessage, receiveMessage };
};

export default useSocket;