import { useEffect, useState } from 'react';
import MainLayout from '../components/Layout';
import { get, post } from '../utils/request';
import PostModal from '../components/PostModal';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const MyPostsPage = () => {
   const [posts, setPosts] = useState([]);
   const [newPostModalOpen, setNewPostModalOpen] = useState(false);
   const [editPostId, setEditPostId] = useState(null);
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [deletePostId, setDeletePostId] = useState(null);

   const fetchPosts = async () => {
      try {
         const res = await get(`${BACKEND_API_URL}/posts/mine`);
         const data = await res.json();
         setPosts(data);
      } catch (error) {
         console.error('Error fetching posts:', error);
      }
   };

   const handleDeletePost = async () => {
      try {
         if (!deletePostId) return;
         await post(`${BACKEND_API_URL}/posts/${deletePostId}/delete`);
         setPosts(posts.filter((post) => post._id !== deletePostId));
         setDeletePostId(null);
         setDeleteModalOpen(false);
      } catch (error) {
         console.error('Error deleting post:', error);
      }
   };
   useEffect(() => {
      fetchPosts();
   }, []);

   useEffect(() => {
      fetchPosts();
   }, [newPostModalOpen]);

   return (
      <MainLayout>
         <div className='max-w-3xl mx-auto mt-10 p-6'>
            <div className='flex justify-between items-center mb-6'>
               <h2 className='text-2xl font-bold'>My Posts</h2>
               <button
                  onClick={() => {
                     setEditPostId(null);
                     setNewPostModalOpen(true);
                  }}
                  className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
               >
                  Create New
               </button>
            </div>

            {posts.map((post) => (
               <div key={post._id} className='bg-white p-4 rounded shadow mb-4'>
                  <h3 className='font-semibold text-lg'>{post.title}</h3>
                  <p className='text-gray-700 mb-2'>{post.content}</p>
                  <div className='flex gap-4'>
                     <button
                        onClick={() => {
                           setEditPostId(post._id);
                           setNewPostModalOpen(true);
                        }}
                        className='text-blue-500 hover:underline'
                     >
                        Edit
                     </button>
                     <button
                        onClick={() => {
                           setDeletePostId(post._id);
                           setDeleteModalOpen(true);
                        }}
                        className='text-red-500 hover:underline'
                     >
                        Delete
                     </button>
                  </div>
               </div>
            ))}

            {deleteModalOpen && (
               <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                  <div className='bg-white p-6 rounded-lg w-96'>
                     <h3 className='text-xl mb-4'>Are you sure you want to delete this post?</h3>
                     <div className='flex justify-end'>
                        <button
                           onClick={handleDeletePost}
                           className='bg-red-500 text-white px-4 py-2 rounded-md'
                        >
                           Delete
                        </button>
                        <button
                           onClick={() => setDeleteModalOpen(false)}
                           className='ml-2 text-gray-500'
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            )}

            <PostModal
               key={editPostId}
               postData={editPostId ? posts.find((post) => post._id === editPostId) : null}
               isEdit={editPostId !== null}
               isOpen={newPostModalOpen}
               onClose={() => {
                  setNewPostModalOpen(false);
                  setEditPostId(null);
               }}
            />
         </div>
      </MainLayout>
   );
};

export default MyPostsPage;
