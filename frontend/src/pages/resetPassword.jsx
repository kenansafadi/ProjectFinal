// ResetPassword.jsx
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { post } from '../utils/request';
import { useNavigate } from 'react-router-dom';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const ResetPassword = () => {
   const params = useSearchParams();
   const verificationCode = params[0]?.get('verificationCode');
   const [newPassword, setNewPassword] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const navigate = useNavigate();

   const handleSubmit = async () => {
      try {
         const res = await post(`${BACKEND_API_URL}/auth/reset-password`, {
            verificationCode,
            password: newPassword,
         });

         const data = await res.json();

         if (data.status == 400) {
            setError(data.message);
            return;
         }

         setSuccess(data.message);
         navigate('/login');
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
            <h2 className='text-2xl font-bold mb-4 text-center'>Reset Password</h2>
            <div className='flex flex-col gap-2'>
               <input
                  type='password'
                  className='w-full p-2 border rounded mb-4'
                  placeholder='New Password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
               />
               <button
                  type='button'
                  onClick={handleSubmit}
                  className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700'
               >
                  Update Password
               </button>
            </div>
         </div>
      </div>
   );
};

export default ResetPassword;
