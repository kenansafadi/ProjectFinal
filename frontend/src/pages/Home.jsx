import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { XCircleIcon } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import MainLayout from '../components/Layout';
import PostCreateModal from '../components/PostModal';
import { get } from '../utils/request';
import moment from 'moment';
import Post from '../components/Post';
import { post } from '../utils/request';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const PostPage = ({ currentUser }) => {
   const [posts, setPosts] = useState([]);
   const [newPost, setNewPost] = useState('');
   const [modalOpen, setModalOpen] = useState(false);
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [postToDelete, setPostToDelete] = useState(null);
   const [newComment, setNewComment] = useState('');
   const [comments, setComments] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');
   const { user } = useAuth();

   const fetchPosts = async () => {
      try {
         const res = await get(`${BACKEND_API_URL}/posts`);
         const data = await res.json();
         setPosts(data);
      } catch (error) {
         console.error('Error fetching posts:', error);
      }
   };

   const handleLikePost = async (postId, isLiked) => {
      try {
         setIsLoading(true);

         const response = await post(`${BACKEND_API_URL}/posts/${postId}/like`, {
            isLiked: !isLiked,
         });
         const data = await response.json();
         if (data.status === 400) {
            setError(data.message);
            return;
         }
      } catch (error) {
         console.log(error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchPosts();
   }, []);

   useEffect(() => {
      fetchPosts();
   }, [isLoading]);

   return (
      <MainLayout>
         <div className='w-full h-full'>
            <h1 className='text-2xl font-bold'>Welcome to the Home Page</h1>
            <div className='flex flex-col gap-4 overflow-y-auto h-full'>
               {posts.map((post) => (
                  <Post
                     isLiked={post?.likes?.includes(user?.id)}
                     handleLikePost={handleLikePost}
                     key={post._id}
                     postData={post}
                  />
               ))}
            </div>
         </div>
      </MainLayout>
   );
};

export default PostPage;
