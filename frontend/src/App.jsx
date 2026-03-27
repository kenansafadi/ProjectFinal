
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/login";
import Register from "./components/Auth/register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import Messages from "./pages/Messages";
import useAuth from "./hooks/useReduxAuth";
import Welcome from "./components/Auth/welcome";
import VerifyEmail from "./pages/verify";
import SettingsPage from "./pages/Settings";
import MyPostsPage from "./pages/MyPost";
import PublicProfile from "./pages/PublicProfile";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Notification from "./pages/Notifications";
import BookmarksPage from "./pages/Bookmarks";
import PostDetail from "./pages/PostDetail";
import { useDispatch } from "react-redux";
import { updateUser, logout } from "./store/reducers/auth";
import { get } from "./utils/request";

// 🔐 Protect routes (only for logged-in users)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// להגן על מסלולים רק לאורחים (למשל, למנוע ממשתמשים מחוברים לגשת לדפי התחברות או הרשמה)
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};


const App = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      get(`${import.meta.env.VITE_BACKEND_API_URL}/users/me`)
        .then((res) => {
          if (!res.ok) {
            dispatch(logout());
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data && data._id) {
            dispatch(updateUser({ profilePicture: data.profilePicture, username: data.username }));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* 🔓 מסלולים ציבוריים */}
        <Route path="/public-profile/:id" element={<PublicProfile />} />
        <Route path="/verify-account" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/welcome" element={<Welcome />} />

        {/* 🚫 אורחים בלבד */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* 🔐 מסלולים מוגנים */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          }
        />

        {/* 🔁 חזרה למסך הראשי */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;