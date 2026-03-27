import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setUserFromToken, logout } from '../store/reducers/auth';
import { decodeToken, isTokenExpired } from '../utils/jwtHelper';

const useAuth = () => {
   const dispatch = useDispatch();
   const { user, token, isAuthenticated } = useSelector((state) => state.auth);

   useEffect(() => {
      if (!token) return;

      // אם הטוקן פג תוקף, בצע התנתקות
      if (isTokenExpired(token)) {
         dispatch(logout());
         return;
      }

      // אם אין משתמש בסטור אבל יש טוקן תקף, פענח את הטוקן והגדר את המשתמש
      if (!user) {
         const decoded = decodeToken(token);
         if (decoded) {
            // הגדר את המשתמש בסטור על סמך הטוקן
            dispatch(setUserFromToken({ user: decoded, token }));
         } else {
            dispatch(logout());
         }
      }
   }, [token, user, dispatch]);

   return { user, token, isAuthenticated };
};

export default useAuth;