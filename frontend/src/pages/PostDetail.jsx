import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { get, post as postReq } from '../utils/request';
import useAuth from '../hooks/useReduxAuth';
import MainLayout from '../components/Layout';
import Post from '../components/Post';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const PostDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { user } = useAuth();
   const [postData, setPostData] = useState(null);
   const [bookmarks, setBookmarks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const fetchPost = async () => {
         try {
            const res = await get(`${BACKEND_API_URL}/posts/${id}`);
            const data = await res.json();
            if (data.message === 'Post not found') {
               setError('Post not found');
               return;
            }
            setPostData(data);
         } catch {
            setError('Failed to load post');
         } finally {
            setLoading(false);
         }
      };

      const fetchBookmarks = async () => {
         try {
            const res = await get(`${BACKEND_API_URL}/users/me`);
            const data = await res.json();
            setBookmarks(data?.bookmarks || []);
         } catch { /* ignore */ }
      };

      fetchPost();
      fetchBookmarks();
   }, [id]);

   const handleLikePost = async (postId, isLiked) => {
      try {
         await postReq(`${BACKEND_API_URL}/posts/${postId}/like`, {
            isLiked: !isLiked,
         });
         const res = await get(`${BACKEND_API_URL}/posts/${id}`);
         const data = await res.json();
         setPostData(data);
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <MainLayout>
         <div className='w-full h-full py-6 pr-2'>
            <button
               onClick={() => navigate(-1)}
               className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 cursor-pointer transition-colors'
            >
               <ArrowLeft className='w-4 h-4' />
               Back
            </button>

            {loading && (
               <div className='flex justify-center py-12'>
                  <div className='w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin' />
               </div>
            )}

            {error && (
               <div className='text-center py-12'>
                  <p className='text-gray-500 text-lg'>{error}</p>
                  <button
                     onClick={() => navigate('/')}
                     className='mt-4 text-sm text-blue-500 hover:text-blue-700 cursor-pointer'
                  >
                     Go to Feed
                  </button>
               </div>
            )}

            {postData && !error && (
               <Post
                  postData={postData}
                  isLiked={postData?.likes?.includes(user?.id)}
                  isBookmarked={bookmarks.includes(postData._id)}
                  handleLikePost={handleLikePost}
               />
            )}
         </div>
      </MainLayout>
   );
};

export default PostDetail;
