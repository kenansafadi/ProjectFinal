// // src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import useClickOutside from '../hooks/useClickOutside'; // optional helper
import { useDispatch } from 'react-redux';
import { logout } from '../store/reducers/auth';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { User2Icon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchDropdown from './NavSearch';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const Navbar = ({}) => {
   const { user } = useAuth();
   const [showNotifications, setShowNotifications] = useState(false);
   const [showUserMenu, setShowUserMenu] = useState(false);
   const dropdownRef = useRef();
   const { socket, errorHandle, disconnect, sendMessage, receiveMessage } = useSocket();
   const [notifications, setNotifications] = useState([]);
   const [search, setSearch] = useState('');

   const navigate = useNavigate();
   const dispatch = useDispatch();
   // Optional: close on outside click
   useClickOutside(dropdownRef, () => {
      setShowNotifications(false);
      setShowUserMenu(false);
   });

   const handleFetchNotifications = async () => {
      const response = await fetch(`${BACKEND_API_URL}/notifications?userId=${user?.id}`);
      const data = await response.json();

      setNotifications(data);
   };

   const handleLogout = () => {
      dispatch(logout());
   };

   useEffect(() => {
      receiveMessage('ReceiveNotification', (msg) => {
         setNotifications((prev) => [...prev, msg]);
      });

      handleFetchNotifications();
   }, []);

   const handleSearch = (e) => {
      console.log(e.target.value);
   };

   return (
      <div className='flex items-center justify-between bg-white shadow px-6 py-4 gap-4'>
         <h1 className='text-xl font-semibold'>Dashboard</h1>

         <SearchDropdown />

         <div className='flex items-center space-x-4 relative' ref={dropdownRef}>
            {/* Notifications */}
            <div className='relative'>
               <div
                  onClick={() => setShowNotifications(!showNotifications)}
                  className='relative focus:outline-none cursor-pointer'
               >
                  <Bell className='w-6 h-6 text-gray-600' />
                  {notifications.length > 0 && (
                     <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.2 rounded-full'>
                        {notifications.length}
                     </span>
                  )}
               </div>

               {/* Notification Dropdown */}
               {showNotifications && (
                  <div className='absolute right-0 mt-2 w-64 bg-white border rounded shadow-md z-10'>
                     <div className='p-3 border-b font-semibold text-gray-700'>Notifications</div>
                     <ul className='max-h-60 overflow-y-auto'>
                        {notifications.map((notif, index) => {
                           if (notif.read) return null;
                           return (
                              <li
                                 onClick={() => navigate(`/notification?id=${notif._id}`)}
                                 key={index}
                                 className='px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                              >
                                 {notif.message}
                              </li>
                           );
                        })}
                     </ul>
                     {notifications.length === 0 && (
                        <div className='px-4 py-2 text-sm text-gray-500'>No new notifications</div>
                     )}
                  </div>
               )}
            </div>

            {/* User Dropdown */}
            <div className='relative'>
               <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center space-x-2 focus:outline-none cursor-pointer'
               >
                  {/* <img
                     src={user?.avatar || '/default-avatar.png'}
                     alt='avatar'
                     className='w-8 h-8 rounded-full'
                  /> */}
                  <User2Icon className='w-5 h-5 rounded-full' />
                  {/* <span className='text-sm'>{user?.username}</span> */}
                  <ChevronDown className='w-4 h-4 text-gray-500' />
               </div>

               {showUserMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-10'>
                     <ul>
                        <li
                           onClick={() => navigate('/profile')}
                           className='px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                        >
                           Profile
                        </li>
                        <li
                           onClick={() => navigate('/settings')}
                           className='px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                        >
                           Settings
                        </li>
                        <li
                           onClick={handleLogout}
                           className='px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                        >
                           Logout
                        </li>
                     </ul>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default Navbar;
