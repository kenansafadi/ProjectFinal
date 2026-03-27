import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import MainLayout from '../components/Layout';
import { get, post } from '../utils/request';
import PostModal from '../components/PostModal';
import moment from 'moment';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const SkeletonCard = () => (
   <div className='bg-white rounded-xl p-5 animate-pulse'>
      <div className='h-4 w-2/3 bg-gray-200 rounded mb-2' />
      <div className='h-3 w-full bg-gray-100 rounded mb-1' />
      <div className='h-3 w-4/5 bg-gray-100 rounded mb-3' />
      <div className='flex gap-3'>
         <div className='h-3 w-10 bg-gray-100 rounded' />
         <div className='h-3 w-12 bg-gray-100 rounded' />
      </div>
   </div>
);

const MyPostsPage = () => {
   const [posts, setPosts] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [newPostModalOpen, setNewPostModalOpen] = useState(false);
   const [editPostId, setEditPostId] = useState(null);
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [deletePostId, setDeletePostId] = useState(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const fetchPosts = async () => {
      try {
         const res = await get(`${BACKEND_API_URL}/posts/mine`);
         const data = await res.json();
         setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error('Error fetching posts:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleDeletePost = async () => {
      try {
         if (!deletePostId) return;
         setIsDeleting(true);
         await post(`${BACKEND_API_URL}/posts/${deletePostId}/delete`);
         setPosts(posts.filter((p) => p._id !== deletePostId));
         setDeletePostId(null);
         setDeleteModalOpen(false);
      } catch (error) {
         console.error('Error deleting post:', error);
      } finally {
         setIsDeleting(false);
      }
   };

   const handleModalClose = () => {
      setNewPostModalOpen(false);
      setEditPostId(null);
      fetchPosts();
   };

   useEffect(() => {
      fetchPosts();
   }, []);

   return (
      <MainLayout>
         <div className='max-w-3xl mx-auto py-8 px-4'>
            <div className='flex justify-between items-center mb-6'>
               <h2 className='text-xl font-bold text-gray-900'>My Posts</h2>
               <button
                  onClick={() => {
                     setEditPostId(null);
                     setNewPostModalOpen(true);
                  }}
                  className='flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer'
               >
                  <Plus className='w-4 h-4' />
                  New Post
               </button>
            </div>

            <div className='space-y-3'>
               {isLoading ? (
                  <>
                     <SkeletonCard />
                     <SkeletonCard />
                     <SkeletonCard />
                  </>
               ) : posts.length === 0 ? (
                  <div className='text-center py-16'>
                     <p className='text-gray-400 text-lg'>No posts yet</p>
                     <p className='text-gray-300 text-sm mt-1'>Create your first post to get started</p>
                  </div>
               ) : (
                  posts.map((p) => (
                     <div key={p._id} className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow'>
                        <h3 className='font-semibold text-gray-900 mb-1'>{p.title}</h3>
                        <p className='text-gray-600 text-sm leading-relaxed mb-3'>{p.content}</p>
                        {p.image && (
                           <img
                              src={`${BACKEND_API_URL.replace('/api', '')}${p.image}`}
                              alt=''
                              className='w-full max-h-48 object-cover rounded-lg mb-3'
                           />
                        )}
                        <div className='flex items-center justify-between'>
                           <span className='text-xs text-gray-400'>{moment(p.createdAt).fromNow()}</span>
                           <div className='flex gap-1'>
                              <button
                                 onClick={() => {
                                    setEditPostId(p._id);
                                    setNewPostModalOpen(true);
                                 }}
                                 className='flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer'
                              >
                                 <Pencil className='w-3 h-3' />
                                 Edit
                              </button>
                              <button
                                 onClick={() => {
                                    setDeletePostId(p._id);
                                    setDeleteModalOpen(true);
                                 }}
                                 className='flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer'
                              >
                                 <Trash2 className='w-3 h-3' />
                                 Delete
                              </button>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Delete Confirmation */}
            {deleteModalOpen && (
               <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'>
                  <div className='bg-white p-6 rounded-xl w-96 shadow-2xl'>
                     <h3 className='text-base font-semibold text-gray-900 mb-2'>Delete Post</h3>
                     <p className='text-sm text-gray-500 mb-5'>This action can't be undone. Are you sure?</p>
                     <div className='flex justify-end gap-2'>
                        <button
                           onClick={() => setDeleteModalOpen(false)}
                           className='text-sm text-gray-500 hover:text-gray-700 px-4 py-2 cursor-pointer'
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleDeletePost}
                           disabled={isDeleting}
                           className='bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50'
                        >
                           {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                     </div>
                  </div>
               </div>
            )}

            <PostModal
               key={editPostId}
               postData={editPostId ? posts.find((p) => p._id === editPostId) : null}
               isEdit={editPostId !== null}
               isOpen={newPostModalOpen}
               onClose={handleModalClose}
            />
         </div>
      </MainLayout>
   );
};

export default MyPostsPage;
