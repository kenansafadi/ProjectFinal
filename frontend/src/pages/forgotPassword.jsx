import { useState } from 'react';
import { post } from '../utils/request';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const ForgotPassword = () => {
   const [email, setEmail] = useState('');
   const [success, setSuccess] = useState('');
   const [error, setError] = useState('');

   const handleSubmit = async (e) => {
      try {
         e.preventDefault();

         if (!email) {
            setError('Email is required');
            return;
         }

         const res = await post(`${BACKEND_API_URL}/auth/forgot-password`, {
            email,
         });

         const data = await res.json();

         if (data.status == 400) {
            setError(data.message);
            return;
         }

         setSuccess(data.message);
      } catch (err) {
         setError(err.message);
      } finally {
         setTimeout(() => {
            setError('');
            setSuccess('');
         }, 3000);
      }
   };

   return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
         <div className='max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg'>
            {error && (
               <p className='mt-4 text-red-600 text-sm bg-red-100 p-1 rounded-md'>{error}</p>
            )}
            {success && (
               <p className='mt-4 text-green-600 text-sm bg-green-100 p-1 rounded-md'>{success}</p>
            )}
            <h2 className='text-2xl font-bold mb-4 text-center'>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
               <input
                  type='text'
                  className='w-full p-2 border rounded mb-4'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
               />
               <button
                  type='submit'
                  className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
               >
                  Send Reset Email
               </button>
            </form>
         </div>
      </div>
   );
};

export default ForgotPassword;
