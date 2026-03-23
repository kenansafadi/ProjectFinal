import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setUserFromToken, logout } from '../store/reducers/auth';
import { decodeToken, isTokenExpired } from '../utils/jwtHelper';

const useAuth = () => {
   const dispatch = useDispatch();
   const { user, token, isAuthenticated } = useSelector((state) => state.auth);

   useEffect(() => {
      if (token && !user) {
         if (isTokenExpired(token)) {
            dispatch(logout());
         } else {
            const decoded = decodeToken(token);
            dispatch(setUserFromToken({ user: decoded, token }));
         }
      }
   }, [token, user, dispatch]);

   return { user, token, isAuthenticated };
};

export default useAuth;