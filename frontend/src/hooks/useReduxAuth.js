import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setUserFromToken, logout } from '../store/reducers/auth';
import { decodeToken, isTokenExpired } from '../utils/jwtHelper';

const useAuth = () => {
   const dispatch = useDispatch();
   const { user, token, isAuthenticated } = useSelector((state) => state.auth);

   useEffect(() => {
      if (!token) return;

      // Always check expiry — not just when !user
      if (isTokenExpired(token)) {
         dispatch(logout());
         return;
      }

      // Rehydration edge case: token exists but user wasn't restored
      if (!user) {
         const decoded = decodeToken(token);
         if (decoded) {
            dispatch(setUserFromToken({ user: decoded, token }));
         } else {
            dispatch(logout());
         }
      }
   }, [token, user, dispatch]);

   return { user, token, isAuthenticated };
};

export default useAuth;