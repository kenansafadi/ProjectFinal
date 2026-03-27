import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useReduxAuth';
import MainLayout from '../components/Layout';
import { get } from '../utils/request';
import Post from '../components/Post';
import { Bookmark } from 'lucide-react';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
// דף שמציג את הפוסטים שהמשתמש סימן כסימניות (bookmarked). הוא משתמש ב-hook של האותנטיקציה כדי לקבל את המידע של המשתמש הנוכחי, ובפונקציה fetchBookmarkedPosts כדי להביא את הפוסטים המסומנים מהשרת. אם אין פוסטים מסומנים, הוא מציג הודעה מתאימה. אם יש פוסטים, הוא מציג אותם ברשימה עם הרכיב Post.
const BookmarksPage = () => {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const { user } = useAuth();

   const fetchBookmarkedPosts = async () => {
      try {
         const res = await get(`${BACKEND_API_URL}/users/bookmarks`); // הבקשה לשרת כדי לקבל את הפוסטים המסומנים של המשתמש הנוכחי
         const data = await res.json();
         setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error('Error fetching bookmarks:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBookmarkedPosts();
   }, []);

   return (
      <MainLayout>
         <div className='w-full h-full'>
            <div className='flex items-center gap-2 mb-6'>
               <Bookmark className='w-6 h-6 text-gray-700' />
               <h1 className='text-2xl font-bold text-gray-800'>Bookmarks</h1>
            </div>

            {loading ? (
               <p className='text-sm text-gray-400'>Loading...</p>
            ) : posts.length === 0 ? (
               <div className='text-center py-16'>
                  <Bookmark className='w-12 h-12 text-gray-200 mx-auto mb-4' />
                  <p className='text-gray-400 text-sm'>No bookmarked posts yet</p>
                  <p className='text-gray-300 text-xs mt-1'>Save posts by tapping the bookmark icon</p>
               </div>
            ) : (
               <div className='flex flex-col gap-4 overflow-y-auto h-full'>
                  {posts.map((p) => (
                     <Post
                        isLiked={p?.likes?.includes(user?.id)}
                        isBookmarked={true}
                        key={p._id}
                        postData={p}
                     />
                  ))}
               </div>
            )}
         </div>
      </MainLayout>
   );
};

export default BookmarksPage;
