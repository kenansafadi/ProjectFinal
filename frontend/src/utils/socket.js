import { io } from "socket.io-client";
import API_BASE_URL from "./api";
const socket = io(API_BASE_URL.replace('http', 'ws'), {
    withCredentials: true,
    transports: ['websocket'],  // Optionally force WebSocket
});

export default socket;
