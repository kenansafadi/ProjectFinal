import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authServices";
import { getToken, setToken, removeToken, decodeToken, isTokenExpired } from "../../utils/jwtHelper";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // For handling loading state
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = () => {
            const token = getToken();
            if (token && !isTokenExpired(token)) {
                const decoded = decodeToken(token);
                setUser(decoded);
                setIsAuthenticated(true);
            } else {
                removeToken();
                setIsAuthenticated(false);
                setUser(null);
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password); // Assuming loginUser returns token and user data
            setToken(data.token); // Store token
            const decoded = decodeToken(data.token);
            setUser(decoded); // Store user data
            setIsAuthenticated(true);
            navigate("/"); // Navigate to home or dashboard after successful login
        } catch (error) {
            console.error("Login error:", error.message);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login");
    };

    const register = async (userData) => {
        try {
            const result = await registerUser(userData); // Assuming registerUser handles registration
            return result;
        } catch (error) {
            console.error("Registration error:", error.message);
            throw error;
        }
    };

    if (loading) return <div>Loading...</div>; // Loading state if checking authentication

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
