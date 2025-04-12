import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const useAuth = () => {
   const { user, token, isAuthenticated } = useSelector((state) => state.auth);

   return { user, token, isAuthenticated };
};

export default useAuth;
