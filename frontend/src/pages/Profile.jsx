import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/request';

import UserAvatar from '../components/common/UserAvatar';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const UserProfile = () => {
   const [userProfile, setUserProfile] = useState({});
   const navigate = useNavigate();
   const [followers, setFollowers] = useState([]);

   const handleFetchUserProfile = async () => {
      try {
         const response = await get(`${BACKEND_API_URL}/users/me`);
         const data = await response.json();
         setFollowers(data?.followers?.filter((follower) => follower.isAccepted));
         setUserProfile(data);
      } catch (error) {
         console.error('Failed to load profile:', error);
      }
   };

   useEffect(() => {
      handleFetchUserProfile();
   }, []);

   return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
         <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6'>
            <ArrowLeft onClick={() => navigate('/')} className='w-5 h-5 mr-2 cursor-pointer' />
            <div className='flex items-center flex-col justify-center gap-2'>
               <UserAvatar
                   src={userProfile?.profilePicture ? (userProfile.profilePicture.startsWith('http') ? userProfile.profilePicture : `${BACKEND_API_URL.replace('/api', '')}${userProfile.profilePicture}`) : null}
                   name={userProfile?.username}
                   size='lg'
                />
               <div className='text-center'>
                  <p className='text-2xl font-semibold'>{userProfile?.username}</p>
                  <p className='text-sm text-gray-500'>{userProfile?.email}</p>
                  {userProfile?.bio && (
                     <p className='text-sm text-gray-600 mt-2 max-w-xs'>{userProfile.bio}</p>
                  )}
               </div>
            </div>

            <div className='text-center mt-4 flex items-center justify-center gap-4'>
               <div className='flex items-center justify-center gap-2'>
                  <p className='text-sm font-medium text-gray-900'>{followers?.length}</p>
                  <p className='text-sm font-medium text-gray-900'>Followers</p>
               </div>
               <div className='flex items-center justify-center gap-2'>
                  <p
                     onClick={() => navigate(`/messages`)}
                     className='text-sm font-medium text-blue-500 hover:underline cursor-pointer'
                  >
                     Messages
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default UserProfile;