import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useReduxAuth';
import MainLayout from '../components/Layout';
import { get, post } from '../utils/request';
import Post from '../components/Post';
import UserAvatar from '../components/common/UserAvatar';
import { getAvatarUrl } from '../utils/avatar';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const BASE_URL = BACKEND_API_URL.replace('/api', '');

const SkeletonPost = () => (
   <div className='bg-white rounded-xl p-6 animate-pulse'>
      <div className='flex items-center mb-4'>
         <div className='w-10 h-10 rounded-full bg-gray-200 mr-3' />
         <div>
            <div className='h-3.5 w-24 bg-gray-200 rounded mb-1.5' />
            <div className='h-2.5 w-16 bg-gray-100 rounded' />
         </div>
      </div>
      <div className='space-y-2 mb-4'>
         <div className='h-4 w-3/4 bg-gray-200 rounded' />
         <div className='h-3 w-full bg-gray-100 rounded' />
         <div className='h-3 w-5/6 bg-gray-100 rounded' />
      </div>
      <div className='h-px bg-gray-100 mb-3' />
      <div className='flex gap-6'>
         <div className='h-3 w-12 bg-gray-100 rounded' />
         <div className='h-3 w-16 bg-gray-100 rounded' />
         <div className='h-3 w-10 bg-gray-100 rounded' />
      </div>
   </div>
);

const SuggestionCard = ({ user, onFollow }) => {
   const [followed, setFollowed] = useState(false);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleFollow = async (e) => {
      e.stopPropagation();
      setLoading(true);
      try {
         const response = await post(`${BACKEND_API_URL}/users/follow`, { userId: user._id, name: user.username });
         if (!response.ok) return;
         setFollowed(true);
         onFollow?.(user);
      } catch { /* ignore */ } finally {
         setLoading(false);
      }
   };

   return (
      <div className='flex items-center gap-3'>
         <UserAvatar
            src={getAvatarUrl(user.profilePicture, BASE_URL)}
            username={user.username}
            size='sm'
         />
         <div className='flex-1 min-w-0 cursor-pointer' onClick={() => navigate(`/public-profile/${user._id}`)}>
            <p className='font-semibold text-sm text-gray-900 truncate hover:underline'>{user.username}</p>
            {user.bio && <p className='text-xs text-gray-400 truncate'>{user.bio}</p>}
         </div>
         <button
            onClick={handleFollow}
            disabled={followed || loading}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
               followed ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
         >
            {followed ? 'Requested' : loading ? '...' : 'Follow'}
         </button>
      </div>
   );
};

const WhoToFollow = ({ suggestions, onFollow, onShowMore, hasMore, isLoadingMore }) => {
   const scrollRef = useRef(null);
   const [expanded, setExpanded] = useState(false);

   useEffect(() => {
      if (!expanded) return;
      const container = scrollRef.current;
      if (!container) return;

      const handleScroll = () => {
         if (!container || isLoadingMore || !hasMore) return;
         const { scrollTop, scrollHeight, clientHeight } = container;
         const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
         if (nearBottom) {
            onShowMore?.();
         }
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
   }, [expanded, hasMore, isLoadingMore, onShowMore]);

   const handleExpand = () => {
      setExpanded(true);
      onShowMore?.();
   };

   if (!suggestions?.length) return null;

   return (
      <div className='bg-white rounded-xl border border-gray-100 shadow-sm pt-5 sticky top-0 overflow-hidden flex flex-col max-h-[500px]'>
         <h3 className='text-sm font-semibold text-gray-700 px-5 mb-4 shrink-0'>Who to follow</h3>
         <div 
            ref={expanded ? scrollRef : null}
            className={`space-y-4 px-5 pb-4 flex-1 ${expanded ? 'overflow-y-auto' : ''}`}
         >
            {suggestions.map(u => (
               <SuggestionCard key={u._id} user={u} onFollow={onFollow} />
            ))}
            {isLoadingMore && (
               <div className='flex justify-center py-3'>
                  <div className='w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin' />
               </div>
            )}
         </div>
         {!expanded && hasMore && (
            <div className='px-5 py-3 border-t border-gray-50'>
               <button 
                  onClick={handleExpand}
                  disabled={isLoadingMore}
                  className='text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50'
               >
                  {isLoadingMore ? 'Loading...' : 'Show more'}
               </button>
            </div>
         )}
      </div>
   );
};

const PendingRequests = ({ requests, onCancel }) => {
   const navigate = useNavigate();
   if (!requests?.length) return null;
   return (
      <div className='bg-white rounded-xl border border-gray-100 shadow-sm mt-4 pt-5 overflow-hidden flex flex-col max-h-[300px]'>
         <h3 className='text-sm font-semibold text-gray-700 px-5 mb-4 shrink-0'>Sent Requests</h3>
         <div className='space-y-4 px-5 pb-4 overflow-y-auto flex-1'>
            {requests.map(req => (
               <div key={req.userId} className='flex items-center justify-between'>
                  <div
                     className='flex items-center gap-2 cursor-pointer'
                     onClick={() => navigate(`/public-profile/${req.userId}`)}
                  >
                     <UserAvatar username={req.name} size={32} />
                     <span
                        className='flex-1 truncate text-sm font-medium text-gray-800 hover:underline'
                        title={req.name}
                     >
                        {req.name.length > 12 ? req.name.substring(0, 12) + '...' : req.name}
                     </span>
                  </div>
                  <button onClick={() => onCancel(req.userId)} className='text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 flex-shrink-0 rounded transition-colors cursor-pointer'>Cancel</button>
               </div>
            ))}
         </div>
      </div>
   );
};

const PostPage = () => {
   const [posts, setPosts] = useState([]);
   const [bookmarks, setBookmarks] = useState([]);
   const [suggestions, setSuggestions] = useState([]);
   const [pendingRequests, setPendingRequests] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [suggestionsPage, setSuggestionsPage] = useState(1);
   const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const { user } = useAuth();

   const fetchPosts = async (page = 1, append = false) => {
      try {
         if (page === 1) setIsLoading(true);
         else setIsLoadingMore(true);
         
         const res = await get(`${BACKEND_API_URL}/posts?suggestionsPage=${page}`);
         const data = await res.json();
         
         if (append) {
            setSuggestions(prev => [...prev, ...(Array.isArray(data.suggestions) ? data.suggestions : [])]);
         } else {
            setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
         }
         
         setPosts(Array.isArray(data.posts) ? data.posts : []);
         setHasMoreSuggestions(Array.isArray(data.suggestions) && data.suggestions.length > 0);
      } catch (error) {
         console.error('Error fetching posts:', error);
      } finally {
         setIsLoading(false);
         setIsLoadingMore(false);
      }
   };

   const handleLoadMore = () => {
      if (isLoadingMore || !hasMoreSuggestions) return;
      const nextPage = suggestionsPage + 1;
      setSuggestionsPage(nextPage);
      fetchPosts(nextPage, true);
   };

   const fetchUserData = async () => {
      try {
         const res = await get(`${BACKEND_API_URL}/users/me`);
         const data = await res.json();
         setBookmarks(data?.bookmarks || []);
         setPendingRequests(data?.following?.filter(f => !f.isAccepted) || []);
      } catch { /* ignore */ }
   };

   const handleCancelRequest = async (userId) => {
      try {
         const res = await post(`${BACKEND_API_URL}/users/unfollow`, { userId });
         if (res.ok) {
            setPendingRequests(prev => prev.filter(req => req.userId !== userId));
            fetchPosts(); 
         }
      } catch (error) {
         console.error('Error cancelling request:', error);
      }
   };

   const handleLikePost = async (postId, isLiked) => {
      try {
         const response = await post(`${BACKEND_API_URL}/posts/${postId}/like`, { isLiked: !isLiked });
         const data = await response.json();
         if (data.status === 400) return;
         fetchPosts();
      } catch (error) {
         console.error(error);
      }
   };

   useEffect(() => {
      fetchPosts();
      fetchUserData();
   }, []);

   useEffect(() => {
      const refreshRequests = () => {
         fetchUserData();
         fetchPosts();
      };
      window.addEventListener('follow-request-updated', refreshRequests);
      return () => window.removeEventListener('follow-request-updated', refreshRequests);
   }, []);

   return (
      <MainLayout>
         <div className='flex gap-6 h-full w-full'>
            {/* Feed column */}
            <div className='flex-1 overflow-y-auto h-full'>
               <div className='flex flex-col gap-4 py-2 pr-1'>
                  {isLoading ? (
                     <>
                        <SkeletonPost />
                        <SkeletonPost />
                        <SkeletonPost />
                     </>
                  ) : posts.length === 0 ? (
                     <div className='flex flex-col items-center justify-center py-20'>
                        <p className='text-gray-400 text-lg'>No posts yet</p>
                        <p className='text-gray-300 text-sm mt-1'>Follow people to see their posts here</p>
                     </div>
                  ) : (
                     posts.map((p) => (
                        <Post
                           isLiked={p?.likes?.includes(user?.id)}
                           isBookmarked={bookmarks.includes(p._id)}
                           handleLikePost={handleLikePost}
                           key={p._id}
                           postData={p}
                        />
                     ))
                  )}
               </div>
            </div>

            {/* Right sidebar — sticky, always visible */}
            {(suggestions.length > 0 || pendingRequests.length > 0) && (
               <div className='w-72 shrink-0 py-2 flex flex-col'>
                  {suggestions.length > 0 && (
                     <WhoToFollow 
                        suggestions={suggestions} 
                        onFollow={(followedUser) => {
                           if (followedUser?._id) {
                              setPendingRequests((prev) => {
                                 const exists = prev.some((req) => req.userId === followedUser._id);
                                 if (exists) return prev;
                                 return [
                                    ...prev,
                                    { userId: followedUser._id, name: followedUser.username, isAccepted: false },
                                 ];
                              });
                           }
                           fetchPosts();
                           fetchUserData();
                        }}
                        onShowMore={handleLoadMore}
                        hasMore={hasMoreSuggestions}
                        isLoadingMore={isLoadingMore}
                     />
                  )}
                  {pendingRequests.length > 0 && (
                     <PendingRequests requests={pendingRequests} onCancel={handleCancelRequest} />
                  )}
               </div>
            )}
         </div>
      </MainLayout>
   );
};

export default PostPage;
