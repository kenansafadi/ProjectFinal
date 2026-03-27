import { io } from "socket.io-client";

const token = localStorage.getItem('TOKEN_KEY'); 

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: false,
    auth: {
        token
    }
});

export default socket;