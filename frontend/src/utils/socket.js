import { io } from "socket.io-client";

const token = localStorage.getItem('TOKEN_KEY'); // your JWT

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: false,
    auth: {
        token // send JWT to backend for auth
    }
});

export default socket;