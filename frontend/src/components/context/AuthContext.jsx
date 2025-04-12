import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, verifyEmail } from "../../services/authServices"; // Correct import path for loginUser
import { getToken, setToken, removeToken, decodeToken } from "../../utils/jwtHelper";
import ProfileContext from "./ProfileContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { setProfile } = useContext(ProfileContext); // Use ProfileContext to clear profile
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (token) {
            const decoded = decodeToken(token);
            setUser(decoded);
        }
    }, []);

    // Using loginUser function from authService
    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);  // Use the loginUser service function
            const { token } = data;  // Extract token from response
            setToken(token); // Save token
            const decoded = decodeToken(token); // Decode token to get user info
            setUser(decoded); // Update user state
            navigate("/"); // Redirect to home or dashboard after login
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Login failed. Please try again.");
        }
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setProfile(null);  // Clear profile in ProfileContext on logout
        navigate("/login");
    };

    const register = async (userData) => {
        const registrationMessage = await registerUser(userData);
        return registrationMessage;
    };

    const verify = async (token) => {
        const verificationMessage = await verifyEmail(token);
        return verificationMessage;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, verify }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
