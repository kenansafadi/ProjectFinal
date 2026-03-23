import React, { useEffect } from "react";
import { useAuth } from "../../components/context/AuthContext"; // Correct import path if necessary
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Perform logout logic
        logout();

        // Redirect user to the login page after logout
        navigate("/login");

        // Optional: Add a small delay before navigation to show the logout message
        // This is helpful if you want to display something like "Logging out..."
    }, [logout, navigate]);

    return (
        <div>
            <h2>Logging out...</h2>
        </div>
    );
};

export default Logout;
