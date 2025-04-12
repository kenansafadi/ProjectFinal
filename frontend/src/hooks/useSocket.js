import { useRef, useEffect } from 'react';
import io from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const useSocket = (callback) => {
   const { user, token } = useAuth();

   const socket = useRef(null);

   useEffect(() => {
      socket.current = io(import.meta.env.VITE_SOCKET_URL, {
         auth: { token: user?.id },
      });

      socket.current.on('connect', () => {
         console.log('Connected to socket server');
         if (callback) {
            callback();
         }
      });

      socket.current.on('disconnect', () => {
         console.log('Disconnected from socket server');
      });

      socket.current.on('connect_error', (error) => {
         console.log('Connection error:', error);
      });

      return () => {
         socket.current.disconnect();
      };
   }, []);

   const errorHandle = (handler) => {
      socket.current.on('connect_error', handler);
   };

   const disconnect = () => {
      if (socket.current) {
         socket.current.disconnect();
      }
   };

   const sendMessage = (channel, messageData) => {
      socket.current.emit(channel, { ...messageData });
   };

   const receiveMessage = (channel, handler) => {
      socket.current.on(channel, handler);
   };

   return {
      socket,
      errorHandle,
      disconnect,
      sendMessage,
      receiveMessage,
   };
};

export default useSocket;
