import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react'; // Follow/Unfollow Icons
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { post, get } from '../utils/request';
import useAuth from '../hooks/useAuth';
import MainLayout from '../components/Layout';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const UserProfile = ({}) => {
   const [userProfile, setUserProfile] = useState({});
   const navigate = useNavigate();
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [success, setSuccess] = useState('');
   const [isFollowed, setIsFollowed] = useState(false);
   const [followers, setFollowers] = useState([]);
   const [totalFollowers, setTotalFollowers] = useState(0);
   const { user } = useAuth();

   // const handleUnfollow = async () => {
   //    try {
   //       setIsLoading(true);
   //       const response = await post(`${BACKEND_API_URL}/users/unfollow`, {
   //          userId: userProfile._id,
   //       });
   //       const data = await response.json();
   //       if (data.status === 400) {
   //          setError(data.message);
   //          return;
   //       }

   //       setSuccess(data.message);
   //    } catch (error) {
   //       setError(error.message);
   //    } finally {
   //       setIsLoading(false);
   //       setTimeout(() => {
   //          setError('');
   //          setSuccess('');
   //       }, 3000);
   //    }
   // };

   // const handleFollow = async () => {
   //    try {
   //       setIsLoading(true);
   //       const response = await post(`${BACKEND_API_URL}/users/follow`, {
   //          userId: userProfile._id,
   //          name: userProfile.username,
   //       });
   //       const data = await response.json();
   //       if (data.status === 400) {
   //          setError(data.message);
   //          return;
   //       }

   //       setSuccess(data.message);
   //    } catch (error) {
   //       setError(error.message);
   //    } finally {
   //       setIsLoading(false);
   //       setTimeout(() => {
   //          setError('');
   //          setSuccess('');
   //       }, 3000);
   //    }
   // };

   const handleFetchUserProfile = async () => {
      try {
         const response = await get(`${BACKEND_API_URL}/users/me`);
         const data = await response.json();

         setUserProfile(data);
      } catch (error) {}
   };

   const handleFetchFollowers = async () => {
      try {
         const response = await get(`${BACKEND_API_URL}/users/followers`);
         const data = await response.json();

         setFollowers(data);
         setTotalFollowers(data?.filter((follower) => follower.isAccepted).length);
      } catch (error) {}
   };

   const handleAcceptFollower = async (followerId) => {
      try {
         setIsLoading(true);
         const response = await post(`${BACKEND_API_URL}/users/accept-friend-request`, {
            userId: followerId,
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

   const handleRejectFollower = async (followerId) => {
      try {
         setIsLoading(true);
         const response = await post(`${BACKEND_API_URL}/users/reject-friend-request`, {
            userId: followerId,
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

   useEffect(() => {
      handleFetchUserProfile();
      handleFetchFollowers();
   }, []);

   useEffect(() => {
      handleFetchFollowers();
   }, [isLoading]);

   return (
      <MainLayout>
         <div className='flex items-center justify-center w-full h-full '>
            <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6'>
               {/* User Info */}
               {error && <p className='text-red-500 bg-red-100 p-2 rounded-md w-full'>{error}</p>}
               {success && (
                  <p className='text-green-500 bg-green-100 p-2 rounded-md w-full'>{success}</p>
               )}
               <ArrowLeft onClick={() => navigate('/')} className='w-5 h-5 mr-2 cursor-pointer' />
               <div className='flex justify-center flex-col items-center mb-6'>
                  <div className='w-24 h-24 rounded-full bg-gray-300 mr-4'>
                     {/* User Avatar */}
                     <img
                        src={userProfile?.profilePicture}
                        //   alt={'avatar'}
                        className='w-full h-full rounded-full object-cover'
                     />
                  </div>
                  <div>
                     <p className='text-2xl font-semibold'>{userProfile?.username}</p>
                     <p className='text-sm text-gray-500'>{userProfile?.email}</p>
                  </div>
               </div>

               {/* Follow Button */}
               <div className='text-center mt-4 flex items-center justify-center gap-1'>
                  <p className='text-sm font-medium text-gray-900'>{totalFollowers}</p>
                  <p className='text-sm font-medium text-gray-900'>Followers</p>

                  {/* <button
                     onClick={isFollowed ? handleUnfollow : handleFollow}
                     className={`flex items-center justify-center px-6 py-2 rounded-md text-white ${
                        isFollowed ? '!bg-red-500' : '!bg-blue-500'
                     }`}
                  >
                     {userProfile._id == user.id ? (
                        <div className='flex items-center justify-center gap-2'>
                           <p className='text-sm font-medium text-gray-900'>
                              {userProfile?.followers?.length}
                           </p>
                           <p className='text-sm font-medium text-gray-900'>Followers</p>
                        </div>
                     ) : isFollowed ? (
                        <>
                           <HeartOff className='w-5 h-5 mr-2' />
                           Unfollow
                        </>
                     ) : (
                        <>
                           <Heart className='w-5 h-5 mr-2' />
                           Follow
                        </>
                     )}
                  </button> */}
               </div>

               <div className='flex flex-col gap-4'>
                  <p className='text-xl font-bold text-gray-800'>Followers</p>

                  <div className='flex flex-col gap-3'>
                     {followers?.length > 0 ? (
                        followers.map((follower) => (
                           <div
                              key={follower.userId}
                              className='flex items-center gap-3 p-3 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition'
                           >
                              <div className='w-10 h-10 rounded-full bg-gray-200 flex-shrink-0' />
                              <div className='flex-1'>
                                 <p className='text-sm font-medium text-gray-900'>
                                    {follower.name}
                                 </p>
                                 {/* Optional subtitle */}
                                 <p className='text-xs text-gray-500'>
                                    @{follower.username || 'username'}
                                 </p>
                              </div>
                              {!follower.isAccepted ? (
                                 <p
                                    onClick={() => handleAcceptFollower(follower.userId)}
                                    className='bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer'
                                 >
                                    Accepted
                                 </p>
                              ) : (
                                 <p
                                    onClick={() => handleRejectFollower(follower.userId)}
                                    className='bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer'
                                 >
                                    Reject
                                 </p>
                              )}
                           </div>
                        ))
                     ) : (
                        <p className='text-sm text-gray-500'>No followers yet.</p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </MainLayout>
   );
};

export default UserProfile;
