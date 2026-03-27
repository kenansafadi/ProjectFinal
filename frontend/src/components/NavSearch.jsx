import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { get } from '../utils/request';
import useAuth from '../hooks/useReduxAuth';
import useClickOutside from '../hooks/useClickOutside';
import UserAvatar from './common/UserAvatar';
import { getAvatarUrl } from '../utils/avatar';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const BASE_URL = BACKEND_API_URL?.replace('/api', '');

const SearchDropdown = ({ autoFocus }) => {
   const [query, setQuery] = useState('');
   const [filteredUsers, setFilteredUsers] = useState([]);
   const [users, setUsers] = useState([]);
   const [focused, setFocused] = useState(false);
   const { token } = useAuth();
   const inputRef = useRef();

   const handleFetchUsers = async () => {
      if (!token) return;
      try {
         const response = await get(`${BACKEND_API_URL}/users`);
         const data = await response.json();
         setUsers(Array.isArray(data) ? data : []);
      } catch {
         setUsers([]);
      }
   };

   const handleSearch = (e) => {
      const value = e.target.value;
      setQuery(value);
      if (!value.trim()) { setFilteredUsers([]); return; }
      setFilteredUsers(users.filter(u => u.username.toLowerCase().includes(value.toLowerCase())));
   };

   const containerRef = useRef();
   useClickOutside(containerRef, () => setFocused(false));

   useEffect(() => {
      if (!token) return;
      handleFetchUsers();
   }, [token]);

   useEffect(() => {
      if (autoFocus) inputRef.current?.focus();
   }, [autoFocus]);

   const showDropdown = focused && query.length > 0;

   return (
      <div className='relative w-full' ref={containerRef}>
         <div className={`flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg transition-colors ${focused ? 'border-gray-300 bg-white' : 'border-transparent'}`}>
            <Search className='w-3.5 h-3.5 text-gray-400 shrink-0' />
            <input
               ref={inputRef}
               type='text'
               placeholder='Search users...'
               value={query}
               onChange={handleSearch}
               onFocus={() => setFocused(true)}
               className='w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none'
            />
         </div>

         {showDropdown && (
            <div className='absolute top-full left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 mt-1.5 overflow-hidden'>
               {filteredUsers.length > 0 ? (
                  <ul className='max-h-52 overflow-y-auto py-1'>
                     {filteredUsers.map((user) => (
                        <li key={user._id}>
                           <Link
                              to={`/public-profile/${user._id}`}
                              className='flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors'
                              onClick={() => { setQuery(''); setFocused(false); }}
                           >
                           <UserAvatar src={getAvatarUrl(user.profilePicture, BASE_URL)} username={user.username} size={28} />
                              <span className='text-sm font-medium text-gray-800'>{user.username}</span>
                           </Link>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <div className='px-4 py-3 text-sm text-gray-400'>No users found</div>
               )}
            </div>
         )}
      </div>
   );
};

export default SearchDropdown;
