// services/googleService.js
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

async function refreshGoogleToken(refreshToken) {
    try {
        const res = await client.refreshToken(refreshToken);
        return res.credentials.access_token;  // This returns the new access token
    } catch (error) {
        throw new Error('Failed to refresh Google access token');
    }
}

module.exports = { refreshGoogleToken };
