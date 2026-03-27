import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import moment from 'moment';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { get, post } from '../utils/request';
import { useState, useEffect } from 'react';
import useNotifications from '../components/hooks/useNotifications';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const NotificationPage = () => {
   const [notification, setNotification] = useState({});
   const [actionState, setActionState] = useState('');
   const id = useSearchParams()[0]?.get('id');
   const { markAsRead } = useNotifications();
   const navigate = useNavigate();

   useEffect(() => {
      const fetchNotifications = async () => {
         try {
            const response = await get(`${BACKEND_API_URL}/notifications/${id}`);
            const data = await response.json();

            setNotification(data);
         } catch (error) {
            console.log(error);
            setNotification({});
         }
      };

      if (id) {
         fetchNotifications();
         markAsRead(id);
      }
   }, [id, markAsRead]);

   const renderIcon = (type) => {
      switch (type) {
         case 'like':
            return <Heart className='text-red-500' size={20} />;
         case 'comment':
            return <MessageCircle className='text-blue-500' size={20} />;
         case 'follow':
            return <UserPlus className='text-green-500' size={20} />;
         default:
            return <Bell className='text-gray-400' size={20} />;
      }
   };

   const handleFollowAction = async (action) => {
      if (!notification?.senderId) return;
      setActionState('loading');
      const endpoint = action === 'accept' ? 'accept-friend-request' : 'reject-friend-request';
      try {
         const response = await post(`${BACKEND_API_URL}/users/${endpoint}`, {
            userId: notification.senderId,
         });
         if (!response.ok) {
            setActionState('idle');
            return;
         }
         setActionState(action);
         window.dispatchEvent(new CustomEvent('follow-request-updated'));
      } catch {
         setActionState('idle');
      }
   };

   return (
      <div className='max-w-2xl mx-auto px-4 py-8'>
         <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold mb-6'>Notifications</h1>
            <Link to='/'>
               <ArrowLeft className='text-gray-400' size={20} />
            </Link>
         </div>

         <div className='bg-white flex flex-col items-start gap-4 p-4 rounded-lg shadow hover:shadow-md transition border border-blue-500'>
            <div>{renderIcon(notification?.type)}</div>

            <div className='flex-1'>
               <p className='text-gray-700 text-sm'>
                  From :{' '}
                  <span
                     className='font-medium text-gray-900 hover:underline cursor-pointer'
                     onClick={() =>
                        notification?.senderId && navigate(`/public-profile/${notification.senderId}`)
                     }
                  >
                     {notification?.sender_name || 'Unknown user'}
                  </span>{' '}
               </p>
               <p className='text-xs text-gray-400 mt-1'>
                  {notification?.createdAt ? moment(notification.createdAt).fromNow() : 'Just now'}
               </p>
            </div>

            <p className='text-gray-700'>{notification?.text || notification?.message || 'No details provided.'}</p>
            {notification?.type === 'follow' && notification?.senderId && (
               <div className='flex items-center gap-2'>
                  {actionState === 'accept' ? (
                     <p className='text-sm text-green-600'>Request accepted</p>
                  ) : actionState === 'reject' ? (
                     <p className='text-sm text-red-600'>Request declined</p>
                  ) : (
                     <>
                        <button
                           type='button'
                           onClick={() => handleFollowAction('accept')}
                           disabled={actionState === 'loading'}
                           className='px-3 py-1.5 text-sm rounded-full bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                        >
                           Accept
                        </button>
                        <button
                           type='button'
                           onClick={() => handleFollowAction('reject')}
                           disabled={actionState === 'loading'}
                           className='px-3 py-1.5 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer'
                        >
                           Decline
                        </button>
                     </>
                  )}
               </div>
            )}
         </div>
      </div>
   );
};

export default NotificationPage;
