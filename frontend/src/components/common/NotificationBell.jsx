import React from "react";
import { Bell } from "lucide-react";
import useNotifications from "../hooks/useNotifications";
const NotificationBell = () => {
    const { notifications } = useNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-bell">
            <Bell />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>
    );
};

export default NotificationBell;
