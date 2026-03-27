import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/request';
import UserAvatar from '../components/common/UserAvatar';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const UserProfile = () => {
   const [userProfile, setUserProfile] = useState({});
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
   const [followers, setFollowers] = useState([]);

   const handleFetchUserProfile = async () => {
      try {
         setLoading(true);
         const response = await get(`${BACKEND_API_URL}/users/me`);
         const data = await response.json();
         setFollowers(data?.followers?.filter((follower) => follower.isAccepted));
         setFollowing(data?.following?.filter((followed) => followed.isAccepted));
         setPendingFollowers(data?.followers?.filter((follower) => !follower.isAccepted) || []);
         setUserProfile(data);
      } catch (error) {
         console.error('Failed to load profile:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      handleFetchUserProfile();
   }, []);

   const handleRequestAction = async (requestUserId, action) => {
      const endpoint = action === 'accept' ? 'accept-friend-request' : 'reject-friend-request';
      setActionLoading(requestUserId);
      try {
         const response = await post(`${BACKEND_API_URL}/users/${endpoint}`, { userId: requestUserId });
         if (!response.ok) return;
         setPendingFollowers((prev) => prev.filter((follower) => follower.userId !== requestUserId));
         if (action === 'accept') {
            const accepted = pendingFollowers.find((follower) => follower.userId === requestUserId);
            if (accepted) {
               setFollowers((prev) => [...prev, { ...accepted, isAccepted: true }]);
            }
         }
         window.dispatchEvent(new CustomEvent('follow-request-updated'));
      } catch (error) {
         console.error('Failed to process request:', error);
      } finally {
         setActionLoading(null);
      }
   };

   return (
      <div className='flex items-center justify-center min-h-screen'>
         <div className='w-full max-w-md p-8 rounded-2xl space-y-6'>
            <ArrowLeft onClick={() => navigate('/')} className='w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer' />
            
            {loading ? (
               <div className='flex items-center justify-center py-12'>
                  <div className='w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin' />
               </div>
            ) : (
               <>
            <div className='flex items-center flex-col justify-center gap-3'>
               <UserAvatar
                   src={userProfile?.profilePicture ? (userProfile.profilePicture.startsWith('http') ? userProfile.profilePicture : `${BACKEND_API_URL.replace('/api', '')}${userProfile.profilePicture}`) : null}
                   name={userProfile?.username}
                   size='lg'
                />
               <div className='text-center'>
                  <p className='text-2xl font-semibold text-gray-900'>{userProfile?.username}</p>
                  <p className='text-sm text-gray-500'>{userProfile?.email}</p>
                  {userProfile?.bio && (
                     <p className='text-sm text-gray-600 mt-2 max-w-xs leading-relaxed'>{userProfile.bio}</p>
                  )}
               </div>
            </div>

            <div className='flex items-center justify-center gap-8 py-2'>
               <div className='text-center'>
                  <p className='text-lg font-semibold text-gray-900'>{followers?.length || 0}</p>
                  <p className='text-xs text-gray-500 uppercase tracking-wide'>Followers</p>
               </div>
               <div className='text-center'>
                  <p className='text-lg font-semibold text-gray-900'>{following?.length || 0}</p>
                  <p className='text-xs text-gray-500 uppercase tracking-wide'>Following</p>
               </div>
               <div className='text-center'>
                  <button
                     onClick={() => navigate(`/messages`)}
                     className='text-xs text-gray-500 uppercase tracking-wide hover:text-gray-900 transition-colors'
                  >
                     Messages
                  </button>
               </div>
            </div>
            
            {pendingFollowers.length > 0 && (
               <div className='border-t border-gray-100 pt-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-3'>Pending requests ({pendingFollowers.length})</p>
                  <div className='space-y-2'>
                     {pendingFollowers.map((request, index) => (
                        <div key={`${request.userId}-${index}`} className='flex items-center justify-between gap-3 py-2'>
                           <div
                              className='flex items-center gap-3 cursor-pointer min-w-0'
                              onClick={() => navigate(`/public-profile/${request.userId}`)}
                           >
                              <UserAvatar name={request.name} size='sm' />
                              <span className='text-sm text-gray-700 truncate hover:text-gray-900 transition-colors'>
                                 {request.name}
                              </span>
                           </div>
                           <div className='flex items-center gap-2 shrink-0'>
                              <button
                                 type='button'
                                 disabled={actionLoading === request.userId}
                                 onClick={() => handleRequestAction(request.userId, 'accept')}
                                 className='px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all'
                              >
                                 {actionLoading === request.userId ? '...' : 'Accept'}
                              </button>
                              <button
                                 type='button'
                                 disabled={actionLoading === request.userId}
                                 onClick={() => handleRequestAction(request.userId, 'reject')}
                                 className='px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all'
                              >
                                 Decline
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
               </>
            )}
         </div>
      </div>
   );
};

export default UserProfile;