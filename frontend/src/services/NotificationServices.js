// services/NotificationService.js
import socket from "../utils/socket";  // Import the singleton socket instance
import { getToken } from "../utils/jwtHelper";
import API_BASE_URL from "../utils/api";

// Fetch notifications for the user (Initial data load)
export const fetchNotifications = async () => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/notifications`, {
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

    const data = await response.json();  // Get the response body
    return data;  // Return the notifications directly as an array
};

// Function to connect to the socket and register for notifications
export const connectNotifications = (userId, onNewNotification) => {
    socket.emit("register", userId);  // Register for the user's notifications

    // Listen for incoming notifications and handle them
    socket.on("receiveNotification", (notification) => {
        onNewNotification(notification);  // Handle the new notification
    });
};

// Function to send a notification (using socket instead of HTTP)
export const sendNotification = (userId, message) => {
    const token = getToken();

    socket.emit("sendNotification", { userId, message, token }); // Emit notification to server
};

// Function to disconnect from the socket
export const disconnectNotifications = () => {
    socket.disconnect();  // Disconnect the socket connection
};
