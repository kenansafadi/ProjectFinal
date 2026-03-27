import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   return (
      <div className='flex h-screen overflow-hidden bg-gray-50'>
         <Sidebar
            mobileOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
         />

         <div className='flex flex-col flex-1 min-w-0 h-full'>
            <Navbar onMenuToggle={() => setMobileMenuOpen(p => !p)} />
            {/* pb-14 on mobile so content isn't hidden behind bottom tab bar */}
            <div className='flex-1 overflow-y-auto'>
               <div className='p-4 md:p-6 pb-20 md:pb-6 h-full'>
                  {children}
               </div>
            </div>
         </div>
      </div>
   );
};

export default MainLayout;
