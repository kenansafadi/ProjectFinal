import { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import useAuth from '../hooks/useReduxAuth';
import MainLayout from '../components/Layout';
import { get, put, postFormData } from '../utils/request';
import UserAvatar from '../components/common/UserAvatar';
import { getAvatarUrl } from '../utils/avatar';
import { useDispatch } from 'react-redux';
import { updateUser } from '../store/reducers/auth';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const SettingsPage = () => {
   const { user } = useAuth();
   const dispatch = useDispatch();
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [showPasswordFields, setShowPasswordFields] = useState(false);
   const [profilePicture, setProfilePicture] = useState(null);
   const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
   const fileInputRef = useRef(null);

   const [formData, setFormData] = useState({
      username: '',
      bio: '',
      isPrivate: false,
   });

   const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
   });

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            const res = await get(`${BACKEND_API_URL}/users/me`);
            const data = await res.json();
            setFormData({
               username: data.username || '',
               bio: data.bio || '',
               isPrivate: data.isPrivate || false,
            });
            setProfilePicture(data.profilePicture || null);
         } catch {
            setError('Failed to load profile');
         } finally {
            setIsLoading(false);
         }
      };
      fetchProfile();
   }, []);

   const flashMessage = (setter, msg) => {
      setter(msg);
      setTimeout(() => setter(''), 3000);
   };

   const handleAvatarUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingAvatar(true);
      try {
         const fd = new FormData();
         fd.append('avatar', file);
         const res = await postFormData(`${BACKEND_API_URL}/users/profile-picture`, fd);
         const data = await res.json();
         if (data.profilePicture) {
            setProfilePicture(data.profilePicture);
            dispatch(updateUser({ profilePicture: data.profilePicture }));
            flashMessage(setSuccess, 'Profile picture updated');
         } else {
            flashMessage(setError, data.message || 'Upload failed');
         }
      } catch {
         flashMessage(setError, 'Failed to upload image');
      } finally {
         setIsUploadingAvatar(false);
      }
   };

   const handleSaveProfile = async () => {
      setIsSaving(true);
      try {
         const res = await put(`${BACKEND_API_URL}/users/update`, formData);
         const data = await res.json();
         if (data.status === 400) {
            flashMessage(setError, data.message);
            return;
         }
         flashMessage(setSuccess, 'Profile updated');
      } catch {
         flashMessage(setError, 'Something went wrong');
      } finally {
         setIsSaving(false);
      }
   };

   const handleChangePassword = async () => {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
         flashMessage(setError, 'Please fill in both password fields');
         return;
      }
      if (passwordData.newPassword.length < 6) {
         flashMessage(setError, 'New password must be at least 6 characters');
         return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
         flashMessage(setError, 'Passwords do not match');
         return;
      }
      setIsSaving(true);
      try {
         const res = await put(`${BACKEND_API_URL}/users/update`, {
            currentPassword: passwordData.currentPassword,
            password: passwordData.newPassword,
         });
         const data = await res.json();
         if (data.status === 400) {
            flashMessage(setError, data.message);
            return;
         }
         flashMessage(setSuccess, 'Password updated');
         setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
         setShowPasswordFields(false);
      } catch {
         flashMessage(setError, 'Something went wrong');
      } finally {
         setIsSaving(false);
      }
   };

   const avatarUrl = getAvatarUrl(profilePicture, BACKEND_API_URL.replace('/api', ''));

   if (isLoading) {
      return (
         <MainLayout>
            <div className='flex items-center justify-center w-full h-full'>
               <div className='w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin' />
            </div>
         </MainLayout>
      );
   }

   return (
      <MainLayout>
         <div className='w-full max-w-lg mx-auto py-8 px-4'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>Settings</h2>

            {error && <p className='text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg mb-4'>{error}</p>}
            {success && <p className='text-green-600 text-sm bg-green-50 border border-green-200 p-3 rounded-lg mb-4'>{success}</p>}

            {/* Profile Section */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
               <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4'>Profile</h3>

               {/* Avatar Upload */}
               <div className='flex items-center gap-4 mb-6'>
                  <div className='relative'>
                     <UserAvatar
                        src={avatarUrl}
                        username={formData.username}
                        size={80}
                        className='border-2 border-gray-100'
                     />
                     <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className='absolute -bottom-1 -right-1 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-700 transition-colors cursor-pointer'
                     >
                        {isUploadingAvatar ? (
                           <div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        ) : (
                           <Camera className='w-3.5 h-3.5' />
                        )}
                     </button>
                     <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/jpeg,image/png,image/gif,image/webp'
                        onChange={handleAvatarUpload}
                        className='hidden'
                     />
                  </div>
                  <div>
                     <p className='text-sm font-medium text-gray-900'>{formData.username}</p>
                     <p className='text-xs text-gray-400'>Click the camera to change your photo</p>
                  </div>
               </div>

               <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
               <input
                  type='text'
                  className='w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4'
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
               />

               <label className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
               <div className='relative mb-4'>
                  <textarea
                     className='w-full border border-gray-200 p-2.5 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                     rows={3}
                     maxLength={160}
                     placeholder='Write something about yourself...'
                     value={formData.bio}
                     onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                  <span className='absolute bottom-2 right-2 text-xs text-gray-400'>
                     {formData.bio.length}/160
                  </span>
               </div>

               <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-gray-700'>Public Account</span>
                  <button
                     onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                     className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${formData.isPrivate ? 'bg-gray-300' : 'bg-blue-500'}`}
                  >
                     <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${!formData.isPrivate ? 'translate-x-4' : ''}`} />
                  </button>
               </div>

               <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className='w-full mt-4 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50'
               >
                  {isSaving ? 'Saving...' : 'Save Profile'}
               </button>
            </div>

            {/* Password Section */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
               <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Password</h3>
                  {!showPasswordFields && (
                     <button
                        onClick={() => setShowPasswordFields(true)}
                        className='text-sm text-blue-500 hover:text-blue-700 font-medium cursor-pointer'
                     >
                        Change
                     </button>
                  )}
               </div>

               {!showPasswordFields ? (
                  <p className='text-sm text-gray-400'>••••••••</p>
               ) : (
                  <div className='space-y-3'>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Current Password</label>
                        <input
                           type='password'
                           className='w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                           value={passwordData.currentPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>New Password</label>
                        <input
                           type='password'
                           className='w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                           value={passwordData.newPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm New Password</label>
                        <input
                           type='password'
                           className='w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                           value={passwordData.confirmPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                     </div>
                     <div className='flex gap-2 pt-1'>
                        <button
                           onClick={handleChangePassword}
                           disabled={isSaving}
                           className='bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50'
                        >
                           {isSaving ? 'Updating...' : 'Update Password'}
                        </button>
                        <button
                           onClick={() => {
                              setShowPasswordFields(false);
                              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                           }}
                           className='text-sm text-gray-500 hover:text-gray-700 px-4 py-2 cursor-pointer'
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </MainLayout>
   );
};

export default SettingsPage;
