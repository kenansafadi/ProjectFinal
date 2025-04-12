// NotificationProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { connectNotifications, disconnectNotifications } from "../../services/NotificationServices";
import useProfile from "../hooks/useProfile";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useProfile(); // Get user from ProfileContext
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]); // Add new notification
    };

    useEffect(() => {
        if (user) {
            connectNotifications(user.id, addNotification);  // Connect to the socket and listen for notifications

            // Cleanup on unmount to disconnect the socket
            return () => {
                disconnectNotifications();
            };
        }
    }, [user]); // Re-run when the user changes (if applicable)

    return (
        <NotificationContext.Provider value={{ notifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
