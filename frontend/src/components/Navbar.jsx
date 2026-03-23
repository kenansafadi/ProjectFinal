// src/components/Navbar.jsx
import React, { useState, useRef } from 'react';
import { Bell, ChevronDown, User2Icon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/reducers/auth';
import { useNavigate } from 'react-router-dom';
import useReduxAuth from '../hooks/useReduxAuth';
import useClickOutside from '../hooks/useClickOutside';
import { useNotifications } from './context/NotificationContext';
import SearchDropdown from './NavSearch';
const Navbar = () => {
   const { user, isAuthenticated } = useReduxAuth();
   const { notifications = [], unreadCount = 0, markAsRead } = useNotifications();

   const [showNotifications, setShowNotifications] = useState(false);
   const [showUserMenu, setShowUserMenu] = useState(false);

   const dropdownRef = useRef();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   useClickOutside(dropdownRef, () => {
      setShowNotifications(false);
      setShowUserMenu(false);
   });

   const handleLogout = () => {
      dispatch(logout());
      navigate('/login'); // optional but recommended
   };

   return (
      <div className='flex items-center justify-between bg-white shadow px-6 py-4 gap-4'>
         <h1 className='text-xl font-semibold'>Dashboard</h1>

         <SearchDropdown />

         <div className='flex items-center space-x-4 relative' ref={dropdownRef}>
            
            {/* 🔔 Notifications */}
            {isAuthenticated && (
               <div className='relative'>
                  <div
                     onClick={() => setShowNotifications(prev => !prev)}
                     className='relative cursor-pointer'
                  >
                     <Bell className='w-6 h-6 text-gray-600' />

                     {unreadCount > 0 && (
                        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full'>
                           {unreadCount}
                        </span>
                     )}
                  </div>

                  {showNotifications && (
                     <div className='absolute right-0 mt-2 w-64 bg-white border rounded shadow-md z-10'>
                        <div className='p-3 border-b font-semibold text-gray-700'>
                           Notifications
                        </div>

                        <ul className='max-h-60 overflow-y-auto'>
                           {Array.isArray(notifications) &&
                              notifications
                                 .filter(notif => !notif.read)
                                 .map((notif) => (
                                    <li
                                       key={notif._id}
                                       onClick={() => {
                                          markAsRead(notif._id);

                                          if (notif.type === 'message' && notif.senderId) {
                                             navigate(`/messages?user_id=${notif.senderId}`);
                                          } else {
                                             navigate(`/notification?id=${notif._id}`);
                                          }

                                          setShowNotifications(false);
                                       }}
                                       className='px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                                    >
                                       {notif.message}
                                    </li>
                                 ))}
                        </ul>

                        {unreadCount === 0 && (
                           <div className='px-4 py-2 text-sm text-gray-500'>
                              No new notifications
                           </div>
                        )}
                     </div>
                  )}
               </div>
            )}

            {/* 👤 User Menu */}
            <div className='relative'>
               <div
                  onClick={() => setShowUserMenu(prev => !prev)}
                  className='flex items-center space-x-2 cursor-pointer'
               >
                  <User2Icon className='w-5 h-5' />
                  <span className='text-sm'>{user?.username || 'Guest'}</span>
                  <ChevronDown className='w-4 h-4 text-gray-500' />
               </div>

               {showUserMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-10'>
                     <ul>
                        {isAuthenticated ? (
                           <>
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
                           </>
                        ) : (
                           <>
                              <li
                                 onClick={() => navigate('/login')}
                                 className='px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                              >
                                 Login
                              </li>
                              <li
                                 onClick={() => navigate('/register')}
                                 className='px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                              >
                                 Register
                              </li>
                           </>
                        )}
                     </ul>
                  </div>
               )}
            </div>

         </div>
      </div>
   );
};

export default Navbar;