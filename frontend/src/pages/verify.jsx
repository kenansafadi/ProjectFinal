import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const VerifyEmail = () => {
   const [email, setEmail] = useState('');
   const [code, setCode] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const navigate = useNavigate();
   const params = useSearchParams()[0];

   useEffect(() => {
      const email = params?.get('email');
      const code = params?.get('code');
      setEmail(email);
      setCode(code);
   }, [params]);

   const handleVerify = async () => {
      try {
         const response = await fetch(`${BACKEND_API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, verificationCode: code }),
         });
         const data = await response.json();

         if (data.status == 400) {
            setError(data.message);
         }

         if (data.status == 200) {
            setSuccess(data.message);
            setTimeout(() => {
               navigate('/');
            }, 3000);
         }
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

   useEffect(() => {
      if (email && code) {
         handleVerify();
      }
   }, [email, code]);

   return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
         <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6'>
            {error && <p className='text-red-500 text-center'>{error}</p>}
            {success && <p className='text-green-500 text-center'>{success}</p>}
            <p className='text-2xl font-bold text-center text-gray-800'>
               Verifying your account...
            </p>
         </div>
      </div>
   );
};

export default VerifyEmail;
