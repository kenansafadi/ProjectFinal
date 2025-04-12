import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import moment from 'moment';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { get, post } from '../utils/request';
import { useState, useEffect } from 'react';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const NotificationPage = () => {
   const [notification, setNotification] = useState({});
   const id = useSearchParams()[0]?.get('id');

   const handleMarkAsRead = async () => {
      try {
         await post(`${BACKEND_API_URL}/notifications/mark-as-read`, {
            notificationId: id,
         });
      } catch (error) {}
   };

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
         handleMarkAsRead();
      }
   }, [id]);

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
                  From : <span className='font-medium'>{notification?.sender_name}</span>{' '}
               </p>
               <p className='text-xs text-gray-400 mt-1'>
                  {moment(notification?.createdAt).fromNow()}
               </p>
            </div>

            <p>{notification?.text}</p>
         </div>
      </div>
   );
};

export default NotificationPage;
