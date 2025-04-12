// src/layouts/MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useAuth from '../hooks/useAuth';

const MainLayout = ({ children }) => {
   const { user } = useAuth();

   return (
      <div className='flex'>
         <Sidebar />

         <div className='flex-1 min-h-screen bg-gray-50'>
            <Navbar currentUser={{ username: user?.name?.first, avatar: user?.avatar }} />
            <div className='p-6 h-[calc(100vh-100px)]'>{children}</div>
         </div>
      </div>
   );
};

export default MainLayout;
