import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const Register = () => {
   const [error, setError] = useState('');
   const navigate = useNavigate();

   const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
   });

   const handleChange = (e) => {
      setFormData((prev) => ({
         ...prev,
         [e.target.name]: e.target.value,
      }));
   };

   const handleSubmit = async (e) => {
      try {
         e.preventDefault();
         const { username, email, password } = formData;
         const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },

            body: JSON.stringify({ username, email, password }),
         });

         const data = await response.json();
         console.log(data);
         if (data.status == 400) {
            setError(data.message);
            return;
         }
         navigate('/welcome');
      } catch (err) {
         if (err.status) {
            setError(err.message);
         }
      } finally {
         setTimeout(() => {
            setError('');
         }, 3000);
      }
   };

   return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
         <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6'>
            <h2 className='text-2xl font-bold text-center text-gray-800'>Create Account</h2>
            {error && (
               <p className='w-full text-center text-red-500 bg-red-100 p-1 rounded-md'>{error}</p>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
               {/* Username */}
               <div>
                  <label className='block text-sm font-medium text-gray-700'>Username</label>
                  <input
                     type='text'
                     name='username'
                     value={formData.username}
                     onChange={handleChange}
                     required
                     placeholder='your_username'
                     className='w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
               </div>

               {/* Email */}
               <div>
                  <label className='block text-sm font-medium text-gray-700'>Email</label>
                  <input
                     type='text'
                     name='email'
                     value={formData.email}
                     onChange={handleChange}
                     required
                     placeholder='you@example.com'
                     className='w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
               </div>

               {/* Password */}
               <div>
                  <label className='block text-sm font-medium text-gray-700'>Password</label>
                  <input
                     type='password'
                     name='password'
                     value={formData.password}
                     onChange={handleChange}
                     required
                     placeholder='********'
                     className='w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
               </div>

               {/* Submit Button */}
               <button
                  type='submit'
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300'
               >
                  Register
               </button>
            </form>

            <p className='text-sm text-center text-gray-500'>
               Already have an account?
               <a href='/login' className='text-blue-600 hover:underline ml-1'>
                  Login
               </a>
            </p>
         </div>
      </div>
   );
};

export default Register;
