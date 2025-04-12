import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../store/reducers/auth';
import { useNavigate } from 'react-router-dom';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const Login = () => {
   const [error, setError] = useState('');
   const dispatch = useDispatch();
   const [formData, setFormData] = useState({ email: '', password: '' });
   const navigate = useNavigate();

   const handleChange = (e) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const handleSubmit = async (e) => {
      try {
         e.preventDefault();
         const { email, password } = formData;
         const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         });
         const data = await response.json();

         if (data.status === 400) {
            setError(data.message);
            return;
         }

         dispatch(
            login({
               user: data.data.user,
               token: data.data.token,
            })
         );

         console.log(data);

         navigate('/');
      } catch (error) {
         if (error.status) {
            setError(error.message);
         }
         console.log(error);
      } finally {
         setTimeout(() => {
            setError('');
         }, 3000);
      }
   };

   return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
         <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6'>
            <h2 className='text-2xl font-bold text-center text-gray-800'>Log In</h2>
            {error && (
               <p className='w-full text-center text-red-500 bg-red-100 p-1 rounded-md'>{error}</p>
            )}
            <form onSubmit={handleSubmit} className='space-y-4'>
               <div>
                  <label className='block text-sm font-medium text-gray-700'>Email</label>
                  <input
                     type='text'
                     name='email'
                     required
                     placeholder='you@example.com'
                     value={formData.email}
                     onChange={handleChange}
                     className='w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
               </div>
               <div>
                  <label className='block text-sm font-medium text-gray-700'>Password</label>
                  <input
                     type='password'
                     name='password'
                     required
                     placeholder='********'
                     value={formData.password}
                     onChange={handleChange}
                     className='w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
               </div>
               <button
                  type='submit'
                  className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition'
               >
                  Log In
               </button>
            </form>
            <p className='text-center text-sm text-gray-500'>
               Forgot your password?{' '}
               <a href='/forgot-password' className='text-blue-600 hover:underline'>
                  Reset
               </a>
            </p>
            <p className='text-center text-sm text-gray-500'>
               Don't have an account?{' '}
               <a href='/register' className='text-blue-600 hover:underline'>
                  Register
               </a>
            </p>
         </div>
      </div>
   );
};

export default Login;
