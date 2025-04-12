import React, { useState } from 'react';
import { XCircleIcon } from 'lucide-react';
import { post, put } from '../utils/request';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const PostCreateModal = ({ isOpen, onClose, postData, isEdit }) => {
   const [title, setTitle] = useState(postData?.title || '');
   const [content, setContent] = useState(postData?.content || '');
   const [error, setError] = useState('');

   const handleSubmit = async () => {
      try {
         if (!title) {
            setError('Title is required');
            return;
         }

         if (!content) {
            setError('Content is required');
            return;
         }

         const url = isEdit
            ? `${BACKEND_API_URL}/posts/${postData._id}`
            : `${BACKEND_API_URL}/posts`;

         const res = await (isEdit ? put(url, { title, content }) : post(url, { title, content }));

         const data = await res.json();

         if (data.status) {
            setError(data.message);
         }

         setError('');
         setTitle('');
         setContent('');
         onClose();
      } catch (error) {
         if (error.status) {
            setError(error.message);
         }
      } finally {
         setTimeout(() => {
            setError('');
         }, 3000);
      }
   };

   return (
      isOpen && (
         <div className='fixed inset-0 flex justify-center items-center bg-black  bg-opacity-40 z-50'>
            <div className='bg-white p-6 rounded-lg w-96'>
               <div className='flex justify-between items-start gap-2'>
                  <div className='flex flex-col gap-2 flex-1'>
                     <h3 className='text-xl font-semibold'>Create Post</h3>
                     {error && (
                        <p className='text-red-500 text-sm bg-red-100 p-2 rounded-md'>{error}</p>
                     )}
                  </div>

                  <XCircleIcon onClick={onClose} className='w-6 h-6' />
               </div>
               <div className='mt-4'>
                  <input
                     type='text'
                     className='w-full p-2 border border-gray-300 rounded-md mb-4'
                     placeholder='Post Title'
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                     className='w-full p-2 border border-gray-300 rounded-md'
                     placeholder='Post Content'
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     rows='4'
                  />
               </div>
               <div className='mt-4 flex justify-end'>
                  <button
                     className='bg-blue-500 text-white px-4 py-2 rounded-md'
                     onClick={handleSubmit}
                  >
                     {isEdit ? 'Update Post' : 'Create Post'}
                  </button>
               </div>
            </div>
         </div>
      )
   );
};

export default PostCreateModal;
