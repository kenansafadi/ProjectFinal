// src/hooks/useClickOutside.js
import { useEffect } from 'react';

const useClickOutside = (ref, handler) => {
   useEffect(() => {
      const handleClick = (event) => {
         // אם הקלק הוא בתוך האלמנט או אם האלמנט לא קיים, אל תעשה כלום
         if (!ref.current || ref.current.contains(event.target)) return;
         handler(event);
      };

      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick); // תמיכה במכשירים ניידים

      return () => {
         document.removeEventListener('mousedown', handleClick);
         document.removeEventListener('touchstart', handleClick);
      };
   }, [ref, handler]);
};

export default useClickOutside;
