import React, { useState, useRef } from 'react';
import { Bell, ChevronDown, Menu, X, Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/reducers/auth';
import { useNavigate } from 'react-router-dom';
import useReduxAuth from '../hooks/useReduxAuth';
import useClickOutside from '../hooks/useClickOutside';
import { useNotifications } from './context/NotificationContext';
import SearchDropdown from './NavSearch';
import UserAvatar from './common/UserAvatar';
import { getAvatarUrl } from '../utils/avatar';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const BASE_URL = BACKEND_API_URL?.replace('/api', '');

const Navbar = ({ onMenuToggle }) => {
   const { user, isAuthenticated } = useReduxAuth();
   const { notifications = [], unreadCount = 0, markAsRead } = useNotifications();

   const [showNotifications, setShowNotifications] = useState(false);
   const [showUserMenu, setShowUserMenu] = useState(false);
   const [showMobileSearch, setShowMobileSearch] = useState(false);

   const dropdownRef = useRef();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   useClickOutside(dropdownRef, () => {
      setShowNotifications(false);
      setShowUserMenu(false);
   });

   const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
   };

   const avatarSrc = getAvatarUrl(user?.profilePicture, BASE_URL);

   return (
      <>
         <header className='flex items-center justify-between bg-white border-b border-gray-100 px-4 md:px-6 h-14 shrink-0'>
            {/* Left: hamburger (mobile) + title */}
            <div className='flex items-center gap-3'>
               <button
                  onClick={onMenuToggle}
                  className='md:hidden text-gray-500 hover:text-gray-800 cursor-pointer'
               >
                  <Menu className='w-5 h-5' />
               </button>
               <span className='text-base font-bold text-gray-900 hidden md:block tracking-tight'>Converscape</span>
            </div>

            {/* Center: Search (hidden on mobile, shown inline on desktop) */}
            <div className='hidden md:flex flex-1 max-w-sm mx-6'>
               <SearchDropdown />
            </div>

            {/* Right: mobile search icon + notifications + avatar */}
            <div className='flex items-center gap-3' ref={dropdownRef}>
               {/* Mobile search toggle */}
               <button
                  onClick={() => setShowMobileSearch(p => !p)}
                  className='md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors'
               >
                  <Search className='w-4 h-4' />
               </button>

               {/* Notifications */}
               {isAuthenticated && (
                  <div className='relative'>
                     <button
                        onClick={() => { setShowNotifications(p => !p); setShowUserMenu(false); }}
                        className='relative cursor-pointer w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
                     >
                        <Bell className='w-4 h-4' />
                        {unreadCount > 0 && (
                           <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full'>
                              {unreadCount > 9 ? '9+' : unreadCount}
                           </span>
                        )}
                     </button>

                     {showNotifications && (
                        <div className='absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden'>
                           <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
                              <span className='text-sm font-semibold text-gray-800'>Notifications</span>
                              {unreadCount > 0 && (
                                 <span className='text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full'>{unreadCount} new</span>
                              )}
                           </div>
                           <ul className='max-h-64 overflow-y-auto divide-y divide-gray-50'>
                              {Array.isArray(notifications) &&
                                 notifications.filter(n => !n.read).map((notif) => (
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
                                       className='flex items-start gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors'
                                    >
                                       <div className='w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0' />
                                       {notif.message}
                                    </li>
                                 ))}
                           </ul>
                           {unreadCount === 0 && (
                              <div className='px-4 py-6 text-sm text-gray-400 text-center'>You're all caught up ✓</div>
                           )}
                        </div>
                     )}
                  </div>
               )}

               {/* Avatar / User Menu */}
               <div className='relative'>
                  <button
                     onClick={() => { setShowUserMenu(p => !p); setShowNotifications(false); }}
                     className='flex items-center gap-2 cursor-pointer group'
                  >
                     <UserAvatar src={avatarSrc} username={user?.username} size='sm' />
                     <span className='hidden md:block text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors max-w-[120px] truncate'>
                        {user?.username || 'Guest'}
                     </span>
                     <ChevronDown className='hidden md:block w-3.5 h-3.5 text-gray-400' />
                  </button>

                  {showUserMenu && (
                     <div className='absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1'>
                        {isAuthenticated ? (
                           <>
                              <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>
                                 Profile
                              </button>
                              <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>
                                 Settings
                              </button>
                              <div className='h-px bg-gray-100 my-1' />
                              <button onClick={handleLogout} className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer'>
                                 Log out
                              </button>
                           </>
                        ) : (
                           <>
                              <button onClick={() => navigate('/login')} className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'>Login</button>
                              <button onClick={() => navigate('/register')} className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'>Register</button>
                           </>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </header>

         {/* Mobile search bar (slides in below header) */}
         {showMobileSearch && (
            <div className='md:hidden px-4 py-2 border-b border-gray-100 bg-white'>
               <SearchDropdown autoFocus />
            </div>
         )}
      </>
   );
};

export default Navbar;