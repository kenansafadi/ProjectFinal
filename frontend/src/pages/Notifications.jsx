// Notifications.jsx
import React, { useEffect } from "react";
import { connectNotifications, disconnectNotifications } from "../services/NotificationService";
import { useNotifications } from "../components/hooks/useNotifications";
import { fetchNotifications } from "../services/NotificationServices";
import { useProfile } from "../context/ProfileContext"; // Import the ProfileContext

const Notifications = () => {
    const { notifications, addNotification } = useNotifications();
    const { user } = useProfile(); // Retrieve user from ProfileContext

    // Make sure user is loaded before attempting to fetch notifications
    useEffect(() => {
        if (user) {
            // Fetch initial notifications
            fetchNotifications()
                .then((res) => {
                    res.forEach(addNotification); // Assuming res is now an array of notifications
                })
                .catch((err) => console.error("Failed to load notifications", err));

            // Connect to socket notifications
            connectNotifications(user.id, addNotification);

            return () => {
                // Cleanup the socket connection on unmount
                disconnectNotifications();
            };
        }
    }, [user, addNotification]); // Only run if user exists

    if (!user) {
        return <div>Loading...</div>; // You can show a loading state if user is not yet available
    }

    return (
        <div className="notifications-page">
            <h2>Notifications</h2>
            <ul>
                {notifications.map((n) => (
                    <li key={n.id}>{n.message}</li> // Ensure each notification has a unique 'id'
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
