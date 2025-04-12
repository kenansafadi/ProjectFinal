import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../utils/request';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const SearchDropdown = () => {
   const [query, setQuery] = useState('');
   const [filteredUsers, setFilteredUsers] = useState([]);
   const [users, setUsers] = useState([]);

   const handleFetchUsers = async () => {
      try {
         const response = await get(`${BACKEND_API_URL}/users/users`);
         const data = await response.json();
         setUsers(data);
      } catch (error) {
         setUsers([]);
      }
   };

   const handleSearch = (e) => {
      const value = e.target.value;
      setQuery(value);

      if (value.trim() === '') {
         setFilteredUsers([]);
         return;
      }

      const filtered = users.filter((user) =>
         user.username.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
   };

   useEffect(() => {
      handleFetchUsers();
   }, []);

   return (
      <div className='flex items-center space-x-4 relative flex-1'>
         <input
            type='text'
            placeholder='Search users'
            value={query}
            onChange={handleSearch}
            className='w-full rounded-full border-2 border-gray-300 p-2 focus:outline-none'
         />

         {query && filteredUsers.length > 0 && (
            <div className='absolute top-full left-0 w-full bg-white shadow-md z-10 rounded-md mt-1 max-h-60 overflow-y-auto'>
               <ul className='divide-y divide-gray-200'>
                  {filteredUsers.map((user) => (
                     <li key={user._id} className='p-2 hover:bg-gray-100'>
                        <Link to={`/public-profile/${user._id}`} className='block'>
                           {user.username}
                        </Link>
                     </li>
                  ))}
               </ul>
            </div>
         )}

         {query && filteredUsers.length === 0 && (
            <div className='absolute top-full left-0 w-full bg-white shadow-md z-10 rounded-md mt-1 p-2 text-gray-500'>
               No users found.
            </div>
         )}
      </div>
   );
};

export default SearchDropdown;
