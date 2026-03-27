import { Home, Settings, MessageSquare, FileText, Bookmark, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menu = [
   { name: 'Explore', icon: Home, path: '/' },
   { name: 'Messages', icon: MessageSquare, path: '/messages' },
   { name: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
   { name: 'My Posts', icon: FileText, path: '/my-posts' },
   { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ mobileOpen, onClose }) {
   const linkClass = ({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
         isActive
            ? 'text-gray-900 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-0.5 before:bg-gray-900 before:rounded-full'
            : 'text-gray-400 hover:text-gray-700'
      }`;

   const navContent = (
      <nav className='flex flex-col h-full'>
         <div className='px-3 py-5 mb-2'>
            <span className='text-lg font-bold text-gray-900 tracking-tight'>Converscape</span>
         </div>
         <ul className='space-y-1 flex-1 px-2'>
            {menu.map((item) => (
               <li key={item.name}>
                  <NavLink to={item.path} className={linkClass} onClick={onClose}>
                     <item.icon size={18} />
                     {item.name}
                  </NavLink>
               </li>
            ))}
         </ul>
      </nav>
   );

   return (
      <>
         {/* Desktop sidebar — always visible ≥ md */}
         <aside className='hidden md:flex flex-col w-56 shrink-0 h-screen bg-white border-r border-gray-100'>
            {navContent}
         </aside>

         {/* Mobile drawer overlay */}
         {mobileOpen && (
            <div className='fixed inset-0 z-50 flex md:hidden'>
               {/* Backdrop */}
               <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
               {/* Drawer */}
               <aside className='relative w-64 h-full bg-white shadow-xl flex flex-col'>
                  <button
                     onClick={onClose}
                     className='absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer'
                  >
                     <X className='w-5 h-5' />
                  </button>
                  {navContent}
               </aside>
            </div>
         )}

         {/* Mobile bottom tab bar */}
         <nav className='fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-100 flex items-center justify-around md:hidden z-40'>
            {menu.slice(0, 5).map((item) => (
               <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                     `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                     }`
                  }
               >
                  <item.icon size={20} />
                  <span className='text-[10px] font-medium'>{item.name}</span>
               </NavLink>
            ))}
         </nav>
      </>
   );
}
