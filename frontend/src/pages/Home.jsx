import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
const Home = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login"); // Redirect to login if user is not authenticated
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <div className="home-container">
            <div className="header">
                <h1>Welcome, {user?.name?.first}!</h1>
                <button onClick={logout} className="logout-btn">
                    Logout
                </button>
            </div>

            {/* Simulate feed */}
            <div className="feed">
                <h2>Your Feed</h2>
                <div className="post">
                    <h3>John Doe</h3>
                    <p>This is a sample post on your feed!</p>
                </div>
                <div className="post">
                    <h3>Jane Smith</h3>
                    <p>Welcome to our platform! Looking forward to connecting.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
