import { jwtDecode } from "jwt-decode";

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

// ✅ pass token as argument instead of pulling from store
export const getUserIdFromToken = (token) => {
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?._id || decoded?.id || decoded?.userId || null;
};