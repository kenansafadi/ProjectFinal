import React from 'react';
import { XCircleIcon } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onDeletePost }) => {
   return (
      isOpen && (
         <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50'>
            <div className='bg-white p-6 rounded-lg w-96'>
               <div className='flex justify-between items-center'>
                  <h3 className='text-xl font-semibold'>Delete Post</h3>
                  <button onClick={onClose} className='text-gray-500'>
                     <XCircleIcon size={24} />
                  </button>
               </div>
               <div className='mt-4'>
                  <p>Are you sure you want to delete this post? This action cannot be undone.</p>
               </div>
               <div className='mt-4 flex justify-end space-x-2'>
                  <button
                     className='bg-red-500 text-white px-4 py-2 rounded-md'
                     onClick={onDeletePost}
                  >
                     Delete
                  </button>
                  <button className='bg-gray-300 text-black px-4 py-2 rounded-md' onClick={onClose}>
                     Cancel
                  </button>
               </div>
            </div>
         </div>
      )
   );
};

export default DeleteConfirmationModal;
