import socket from "../utils/socket";
import API_BASE_URL from "../utils/api";

// ✅ pass token as argument
export const fetchNotifications = async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/notifications?userId=${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch notifications");
    }

    return await response.json();
};

export const connectNotifications = (userId, token, onNewNotification) => {
    socket.auth = { token }; // ✅ use real token (not userId anymore)
    socket.connect();

    socket.emit("register", userId);

    socket.on("ReceiveNotification", (notification) => {
        onNewNotification(notification);
    });
};

export const sendNotification = (userId, message, token) => {
    socket.emit("sendNotification", { userId, message, token });
};

export const disconnectNotifications = () => {
    socket.disconnect();
};