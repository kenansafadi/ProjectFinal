import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authServices";
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

    const login = async (token) => {
        setToken(token);
        const decoded = decodeToken(token);
        setUser(decoded);
        navigate("/");
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setProfile(null);  // Clear profile in ProfileContext on logout
        navigate("/login");
    };

    const register = async (userData) => {
        return registerUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
