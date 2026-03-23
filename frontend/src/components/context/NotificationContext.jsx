// NotificationProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { connectNotifications, disconnectNotifications } from "../../services/NotificationServices";
import useAuth from "../../hooks/useReduxAuth";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth(); // Get user from Auth hook
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]); // Add new notification
    };

    const markAsRead = async (notificationId) => {
        // Optimistically update local state
        setNotifications((prev) =>
            prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        );

        // Update backend
        try {
            const { post } = await import("../../utils/request");
            const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
            await post(`${BACKEND_API_URL}/notifications/mark-as-read`, { notificationId });
        } catch (error) {
            console.error("Failed to mark notification as read", error);
            // Optionally revert optimistically updated state here
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (user) {
            import("../../services/NotificationServices").then(({ fetchNotifications, connectNotifications, disconnectNotifications }) => {
                const userId = user.id || user._id;
                fetchNotifications(userId).then((data) => {
                    setNotifications(data || []);
                }).catch(err => console.error("Failed to load notifications", err));

                connectNotifications(userId, addNotification);  // Connect to the socket and listen for notifications
            });

            // Cleanup on unmount to disconnect the socket
            return () => {
                import("../../services/NotificationServices").then(({ disconnectNotifications }) => {
                    disconnectNotifications();
                });
            };
        }
    }, [user]); // Re-run when the user changes (if applicable)

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
