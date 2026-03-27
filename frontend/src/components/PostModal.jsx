import { useState, useRef, useEffect } from 'react';
import { XCircleIcon, ImagePlus, X } from 'lucide-react';
import { put, postFormData } from '../utils/request';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const PostCreateModal = ({ isOpen, onClose, postData, isEdit }) => {
   const [title, setTitle] = useState(postData?.title || '');
   const [content, setContent] = useState(postData?.content || '');
   const [error, setError] = useState('');
   const [imageFile, setImageFile] = useState(null);
   const [imagePreview, setImagePreview] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const fileInputRef = useRef(null);
   const modalRef = useRef(null);

   useEffect(() => {
      if (!isOpen) return;
      const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
   }, [isOpen, onClose]);

   const handleBackdropClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
   };

   const handleImageSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
   };

   const removeImage = () => {
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
   };

   const handleSubmit = async () => {
      try {
         if (!title) { setError('Title is required'); return; }
         if (!content) { setError('Content is required'); return; }

         setIsSubmitting(true);

         if (isEdit) {
            const res = await put(`${BACKEND_API_URL}/posts/${postData._id}`, { title, content });
            const data = await res.json();
            if (data.status === 400) { setError(data.message); return; }
         } else {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('content', content);
            if (imageFile) fd.append('image', imageFile);

            const res = await postFormData(`${BACKEND_API_URL}/posts`, fd);
            const data = await res.json();
            if (data.status === 400 || data.status === 500) { setError(data.message); return; }
         }

         setError('');
         setTitle('');
         setContent('');
         removeImage();
         onClose();
      } catch (err) {
         setError(err.message || 'Something went wrong');
      } finally {
         setIsSubmitting(false);
         setTimeout(() => setError(''), 3000);
      }
   };

   if (!isOpen) return null;

   return (
      <div
         className='fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50'
         onClick={handleBackdropClick}
      >
         <div ref={modalRef} className='bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl'>
            <div className='flex justify-between items-center p-5 border-b border-gray-100'>
               <h3 className='text-lg font-semibold text-gray-900'>
                  {isEdit ? 'Edit Post' : 'Create Post'}
               </h3>
               <button onClick={onClose} className='text-gray-400 hover:text-gray-600 cursor-pointer'>
                  <XCircleIcon className='w-5 h-5' />
               </button>
            </div>

            <div className='p-5 space-y-3'>
               {error && (
                  <p className='text-red-600 text-sm bg-red-50 border border-red-200 p-2.5 rounded-lg'>{error}</p>
               )}
               <input
                  type='text'
                  className='w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Post title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
               />
               <textarea
                  className='w-full border border-gray-200 p-2.5 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows='4'
               />

               {imagePreview && (
                  <div className='relative'>
                     <img
                        src={imagePreview}
                        alt='Preview'
                        className='w-full max-h-48 object-cover rounded-lg border border-gray-100'
                     />
                     <button
                        onClick={removeImage}
                        className='absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 cursor-pointer'
                     >
                        <X className='w-3.5 h-3.5' />
                     </button>
                  </div>
               )}
            </div>

            <div className='flex items-center justify-between p-5 pt-0'>
               {!isEdit ? (
                  <button
                     onClick={() => fileInputRef.current?.click()}
                     className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 cursor-pointer transition-colors'
                  >
                     <ImagePlus className='w-5 h-5' />
                     Photo
                  </button>
               ) : <div />}
               <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/png,image/gif,image/webp'
                  onChange={handleImageSelect}
                  className='hidden'
               />
               <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className='bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50'
               >
                  {isSubmitting ? 'Posting...' : isEdit ? 'Update' : 'Post'}
               </button>
            </div>
         </div>
      </div>
   );
};

export default PostCreateModal;
