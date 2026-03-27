import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { post, get } from '../utils/request';
import useAuth from '../hooks/useReduxAuth';
import MainLayout from '../components/Layout';
import { useParams } from 'react-router-dom';
import UserAvatar from '../components/common/UserAvatar';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const UserProfile = ({}) => {
   const [userProfile, setUserProfile] = useState({});
   const navigate = useNavigate();
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [success, setSuccess] = useState('');
   const [isFollowed, setIsFollowed] = useState(false);
   const [isAccepted, setIsAccepted] = useState(false);
   const [followers, setFollowers] = useState([]);
   const [following, setFollowing] = useState([]);
   const { user } = useAuth();
   const { id } = useParams();

   const handleUnfollow = async () => {
      try {
         setIsLoading(true);
         const response = await post(`${BACKEND_API_URL}/users/unfollow`, {
            userId: userProfile._id,
         });
         const data = await response.json();
         if (data.status === 400) {
            setError(data.message);
            return;
         }

         setSuccess(data.message);
      } catch (error) {
         setError(error.message);
      } finally {
         setIsLoading(false);
         setTimeout(() => {
            setError('');
            setSuccess('');
         }, 3000);
      }
   };

   const handleFollow = async () => {
      try {
         setIsLoading(true);
         const response = await post(`${BACKEND_API_URL}/users/follow`, {
            userId: userProfile._id,
            name: userProfile.username,
         });
         const data = await response.json();
         if (data.status === 400) {
            setError(data.message);
            return;
         }

         setSuccess(data.message);
      } catch (error) {
         setError(error.message);
      } finally {
         setIsLoading(false);
         setTimeout(() => {
            setError('');
            setSuccess('');
         }, 3000);
      }
   };

   const handleFetchUserProfile = async () => {
      try {
         const response = await get(`${BACKEND_API_URL}/users/public/${id}`);
         const data = await response.json();
         setFollowers(data?.followers?.filter((follower) => follower.isAccepted));
         setFollowing(data?.following?.filter((followed) => followed.isAccepted));
         setIsFollowed(data?.followers?.some((follower) => follower.userId == user?.id));
         setIsAccepted(
            data?.followers?.some((follower) => follower.userId == user?.id && follower.isAccepted)
         );

         setUserProfile(data);
      } catch (error) {
         console.error('Failed to load user profile:', error);
      }
   };

   useEffect(() => {
      handleFetchUserProfile();
   }, [id]);

   useEffect(() => {
      handleFetchUserProfile();
   }, [isLoading]);

   return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
         <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6'>
            {/* User Info */}
            {error && <p className='text-red-500 bg-red-100 p-2 rounded-md w-full'>{error}</p>}
            {success && (
               <p className='text-green-500 bg-green-100 p-2 rounded-md w-full'>{success}</p>
            )}
            <ArrowLeft onClick={() => navigate('/')} className='w-5 h-5 mr-2 cursor-pointer' />
            <div className='flex items-center flex-col    justify-center gap-2'>
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

            {/* Follow Button */}
            <div className='text-center mt-4 flex items-center justify-center gap-4'>
               {userProfile?._id !== user?.id && (
                  <button
                     onClick={isFollowed ? (isAccepted ? handleUnfollow : () => {}) : handleFollow}
                     className={`flex items-center justify-center px-6 py-2 rounded-md text-white cursor-pointer ${
                        isFollowed
                           ? !isAccepted
                              ? '!bg-green-500'
                              : '!bg-red-500'
                           : '!bg-blue-500'
                     }`}
                  >
                     {isFollowed ? (
                        isAccepted ? (
                           <>
                              <HeartOff className='w-5 h-5 mr-2' />
                              Unfollow
                           </>
                        ) : (
                           'Pending'
                        )
                     ) : (
                        <>
                           <Heart className='w-5 h-5 mr-2' />
                           Follow
                        </>
                     )}
                  </button>
               )}

               <div className='flex items-center justify-center gap-2'>
                  <p className='text-sm font-medium text-gray-900'>{followers?.length}</p>
                  <p className='text-sm font-medium text-gray-900'>Followers</p>
               </div>
               <div className='flex items-center justify-center gap-2'>
                  <p className='text-sm font-medium text-gray-900'>{following?.length}</p>
                  <p className='text-sm font-medium text-gray-900'>Following</p>
               </div>
               {!userProfile?.isPrivate && (
                  <div className='flex items-center justify-center gap-2 '>
                     <p
                        onClick={() => navigate(`/messages?user_id=${userProfile?._id}`)}
                        className='text-sm font-medium text-blue-500 hover:underline cursor-pointer'
                     >
                        Message
                     </p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default UserProfile;
