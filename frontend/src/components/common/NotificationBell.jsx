import React from "react";
import { Bell } from "lucide-react";
import useNotifications from "../hooks/useNotifications";
const NotificationBell = () => {
    const { unreadCount } = useNotifications();

    return (
        <div className="notification-bell cursor-pointer">
            <Bell />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>
    );
};

export default NotificationBell;
