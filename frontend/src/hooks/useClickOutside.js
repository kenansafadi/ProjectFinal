// src/hooks/useClickOutside.js
import { useEffect } from 'react';

const useClickOutside = (ref, handler) => {
   useEffect(() => {
      const handleClick = (event) => {
         // Ignore click if ref is not set or the click is inside the ref element
         if (!ref.current || ref.current.contains(event.target)) return;
         handler(event);
      };

      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick); // for mobile

      return () => {
         document.removeEventListener('mousedown', handleClick);
         document.removeEventListener('touchstart', handleClick);
      };
   }, [ref, handler]);
};

export default useClickOutside;
