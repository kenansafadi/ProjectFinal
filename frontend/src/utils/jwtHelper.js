// utils/jwtHelper.js
import { jwtDecode } from "jwt-decode";


export const setToken = (token) => {
    // You can set a token in a cookie using a library like js-cookie
    // Or set it in the response from the server with httpOnly flag
    document.cookie = `token=${token}; path=/; Secure; SameSite=Strict; HttpOnly`;
};

export const getToken = () => {
    // Extract token from cookies
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

export const removeToken = () => {
    // Remove the token cookie
    document.cookie = 'token=; Max-Age=0; path=/; Secure; SameSite=Strict';
};

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
};

export const getUserIdFromToken = () => {
    const token = getToken(); // ✅ Use the cookie-based token retrieval
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?._id || decoded?.id || decoded?.userId || null;
};
