import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import NotificationBell from "../common/NotificationBell"
const SideBar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        { label: "Home", icon: "🏠", path: "/" },
        { label: "Explore", icon: "🔍", path: "/explore" },
        { label: "Messages", icon: "💬", path: "/chat" },
        { label: "Notifications", icon: "🔔", path: "/notifications" },
        { label: "Profile", icon: "👤", path: "/profile" },
        { label: "Settings", icon: "⚙️", path: "/settings" },
    ];

    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    {navItems.map((item) => (
                        <li key={item.label} onClick={() => navigate(item.path)}>
                            <span className="icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Add NotificationBell component here */}
            <NotificationBell />

            <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
            </button>
        </aside>
    );
};

export default SideBar;
