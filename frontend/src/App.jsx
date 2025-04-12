import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getToken, isTokenExpired, decodeToken } from "./utils/jwtHelper";
import Login from "./components/Auth/login";
import Register from "./components/Auth/register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import Messages from './pages/Messages';
import useAuth from './hooks/useAuth';
import Welcome from './components/Auth/welcome';
import VerifyEmail from './pages/verify';
import SettingsPage from './pages/Settings';
import MyPostsPage from './pages/MyPost';
import PublicProfile from './pages/PublicProfile';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import Notification from './pages/Notifications';

const App = () => {
   const { user, isAuthenticated } = useAuth();

   return (
      <>
         <Toaster position='top-right' />

         <Routes>
            <Route
               path='/messages'
               element={isAuthenticated ? <Messages /> : <Navigate to='/login' />}
            />
            <Route path='/' element={isAuthenticated ? <Home /> : <Navigate to='/login' />} />
            <Route path='/login' element={<Login />} />

            <Route
               path='/register'
               element={isAuthenticated ? <Navigate to='/' /> : <Register />}
            />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/verify-account' element={<VerifyEmail />} />
            <Route path='/notification' element={<Notification />} />
            <Route path='/welcome' element={<Welcome />} />
            <Route
               path='/profile'
               element={!isAuthenticated ? <Navigate to='/login' /> : <Profile user={user} />}
            />
            <Route
               path='/settings'
               element={!isAuthenticated ? <Navigate to='/login' /> : <SettingsPage />}
            />
            <Route
               path='/my-posts'
               element={!isAuthenticated ? <Navigate to='/login' /> : <MyPostsPage />}
            />
            <Route path='/public-profile/:id' element={<PublicProfile />} />
            <Route path='*' element={<Navigate to='/' />} />
         </Routes>
      </>
   );
};

export default App;
