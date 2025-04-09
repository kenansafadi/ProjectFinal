const jwt = require('jsonwebtoken');
const { jwtKey } = require('../config/jwtConfig'); // Import the JWT key from jwtConfig

// JWT Expiration time (adjust as necessary)
const JWT_EXPIRATION = '1h'; // 1 hour expiration

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object (usually contains user ID or other info)
 * @returns {string} - The generated JWT token
 */
const generateToken = (user) => {
    const payload = {
        userId: user._id, // You can add more fields to the payload as needed
        email: user.email,
    };

    // Create JWT token with the payload and sign it with the secret from jwtConfig
    return jwt.sign(payload, jwtKey, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verifies the JWT token.
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} - The decoded token or null if the token is invalid/expired
 */
const verifyToken = (token) => {
    try {
        // Verify token using the jwtKey
        const decoded = jwt.verify(token, jwtKey);
        return decoded; // If valid, return decoded data
    } catch (error) {
        return null; // Return null if invalid or expired
    }
};

/**
 * Decodes the JWT token without verifying it (use cautiously).
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} - The decoded data or null if invalid
 */
const decodeToken = (token) => {
    try {
        // Decode the token without verification (this does not check validity)
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

/**
 * Checks if the JWT token is expired.
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if expired, false otherwise
 */
const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime; // Check if expiration time is before the current time
    }
    return false;
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
};
