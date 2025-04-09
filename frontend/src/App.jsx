import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getToken, isTokenExpired, decodeToken } from "./utils/jwtHelper";
import Login from "./components/Auth/login";
import Register from "./components/Auth/register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();

    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      setIsAuthenticated(true);
      setUser(decoded);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile" element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
