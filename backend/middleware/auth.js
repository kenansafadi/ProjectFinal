const { verifyToken, decodeToken, isTokenExpired } = require('../utils/jwtHelper');
const config = require('../config/jwtConfig');

module.exports = (req, res, next) => {
    let token = req.header("x-auth-token");

    // Check if the token is in the Authorization header (Bearer token)
    if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify token
        verifyToken(token, config.jwtKey);

        // Check if the token is expired
        if (isTokenExpired(token)) {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }

        // Decode the token to get the user info
        const decoded = decodeToken(token);

        // Attach the user info to the request object
        req.user = decoded;

        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};
