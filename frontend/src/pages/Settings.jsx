// SettingsPage.jsx
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import MainLayout from '../components/Layout';
import { useDispatch } from 'react-redux';
import { updateUser } from '../store/reducers/auth';
import { put } from '../utils/request';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const SettingsPage = ({}) => {
   const { user } = useAuth();
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [userData, setUserData] = useState({
      name: user?.username || '',
      password: '',
      isPrivate: user?.isPrivate || false,
   });

   console.log(userData);
   const [success, setSuccess] = useState('');
   const dispatch = useDispatch();

   const handleUpdate = async () => {
      try {
         const res = await put(`${BACKEND_API_URL}/users/update`, userData);
         const data = await res.json();

         if (data.status === 400) {
            setError(data.message);
            return;
         }

         dispatch(updateUser({ username: data?.data?.name, isPrivate: data?.data?.isPrivate }));

         setSuccess(data.message);
      } catch (err) {
         console.log(err);
         setError('Something went wrong');
      } finally {
         setIsLoading(false);
         setTimeout(() => {
            setError('');
            setSuccess('');
         }, 3000);
      }
   };

   const handleChange = (e) => {
      if (e.target.name === 'isPrivate') {
         setUserData({ ...userData, [e.target.name]: e.target.checked });
      } else {
         setUserData({ ...userData, [e.target.name]: e.target.value });
      }
   };

   return (
      <MainLayout>
         <div className='flex items-center justify-center w-full h-full '>
            <div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md '>
               <h2 className='text-xl font-semibold mb-4'>Account Settings</h2>
               {error && <p className='text-red-500 mb-4 bg-red-100 p-2 rounded-md'>{error}</p>}
               {success && (
                  <p className='text-green-600 mb-4 bg-green-100 p-2 rounded-md'>{success}</p>
               )}
               <label className='block mb-2 text-sm font-medium'>Name</label>
               <input
                  type='text'
                  className='w-full border p-2 mb-4 rounded-md'
                  value={userData.name}
                  onChange={handleChange}
                  name='name'
               />

               <div className='flex items-center w-[max-content] gap-2 mb-4'>
                  <label className='block text-sm font-medium'>Account Public</label>
                  <input
                     type='checkbox'
                     className='w-full block border p-2  rounded-md '
                     checked={userData.isPrivate}
                     onChange={handleChange}
                     name='isPrivate'
                  />
               </div>
               <label className='block mb-2 text-sm font-medium'>New Password</label>
               <input
                  type='password'
                  className='w-full border p-2 mb-4 rounded-md'
                  value={userData.password}
                  onChange={handleChange}
                  name='password'
               />

               <button
                  className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                  onClick={handleUpdate}
               >
                  Save Changes
               </button>
            </div>
         </div>
      </MainLayout>
   );
};

export default SettingsPage;
