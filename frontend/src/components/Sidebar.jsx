import { Home, Settings, MessageSquare, File } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menu = [
   { name: 'Explore', icon: <Home size={20} />, path: '/' },
   { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
   { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
   { name: 'My Posts', icon: <File size={20} />, path: '/my-posts' },
];

export default function Sidebar() {
   return (
      <aside className='w-64 h-screen bg-gray-100 p-4'>
         <ul className='space-y-2'>
            {menu.map((item) => (
               <li key={item.name}>
                  <NavLink
                     to={item.path}
                     className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-200 ${
                           isActive ? 'bg-gray-200 font-semibold' : ''
                        }`
                     }
                  >
                     {item.icon}
                     {item.name}
                  </NavLink>
               </li>
            ))}
         </ul>
      </aside>
   );
}
