import React, { useState, useEffect } from 'react';
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
         await post(`${BACKEND_API_URL}/users/follow`, { userId: user._id, name: user.username });
         setFollowed(true);
      } catch { /* ignore */ } finally {
         setLoading(false);
      }
      onFollow?.();
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

const WhoToFollow = ({ suggestions, onFollow, onShowMore }) => {
   if (!suggestions?.length) return null;
   return (
      <div className='bg-white rounded-xl border border-gray-100 shadow-sm pt-5 sticky top-0 overflow-hidden'>
         <h3 className='text-sm font-semibold text-gray-700 px-5 mb-4'>Who to follow</h3>
         <div className='space-y-4 px-5 pb-4'>
            {suggestions.map(u => (
               <SuggestionCard key={u._id} user={u} onFollow={onFollow} />
            ))}
         </div>
         <div className='px-5 pb-5'>
            <button onClick={onShowMore} className='text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer'>Show more</button>
         </div>
      </div>
   );
};

const PostPage = () => {
   const [posts, setPosts] = useState([]);
   const [bookmarks, setBookmarks] = useState([]);
   const [suggestions, setSuggestions] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [suggestionsLimit, setSuggestionsLimit] = useState(6);
   const { user } = useAuth();

   const fetchPosts = async (limit = suggestionsLimit) => {
      try {
         const res = await get(`${BACKEND_API_URL}/posts?suggestionsLimit=${limit}`);
         const data = await res.json();
         setPosts(Array.isArray(data.posts) ? data.posts : []);
         setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (error) {
         console.error('Error fetching posts:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleShowMore = () => {
      const next = suggestionsLimit + 6;
      setSuggestionsLimit(next);
      fetchPosts(next);
   };

   const fetchBookmarks = async () => {
      try {
         const res = await get(`${BACKEND_API_URL}/users/me`);
         const data = await res.json();
         setBookmarks(data?.bookmarks || []);
      } catch { /* ignore */ }
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
      fetchBookmarks();
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
            {suggestions.length > 0 && (
               <div className='w-72 shrink-0 py-2'>
            <WhoToFollow suggestions={suggestions} onFollow={fetchPosts} onShowMore={handleShowMore} />
               </div>
            )}
         </div>
      </MainLayout>
   );
};

export default PostPage;
